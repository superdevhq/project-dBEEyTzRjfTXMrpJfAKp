
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { Resend } from 'https://esm.sh/resend@1.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY') || ''
    
    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const resend = new Resend(resendApiKey)

    // Get users who have opted in to reminders
    // Note: You might want to add a 'reminder_enabled' column to your users or profiles table
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, username, reminder_enabled')
      .eq('reminder_enabled', true)

    if (error) {
      throw error
    }

    console.log(`Found ${users?.length || 0} users with reminders enabled`)

    // For each user, check if they've logged a workout today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISOString = today.toISOString()

    const remindersSent = []
    const errors = []

    for (const user of users || []) {
      try {
        // Check if user has already logged a workout today
        const { data: workouts, error: workoutError } = await supabase
          .from('workouts')
          .select('id')
          .eq('user_id', user.id)
          .gte('date', todayISOString)
          .limit(1)

        if (workoutError) {
          throw workoutError
        }

        // If user hasn't logged a workout today, send a reminder
        if (!workouts || workouts.length === 0) {
          const { data: emailResult, error: emailError } = await resend.emails.send({
            from: 'FitTrack <notifications@yourdomain.com>',
            to: user.email,
            subject: '💪 Daily Workout Reminder',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hey ${user.username || 'you'}!</h2>
                <p>Just a friendly reminder to log your workout for today in FitTrack.</p>
                <p>Consistent tracking is key to achieving your fitness goals!</p>
                <div style="margin: 30px 0;">
                  <a href="${supabaseUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Log Your Workout
                  </a>
                </div>
                <p style="color: #666; font-size: 12px;">
                  If you'd like to stop receiving these reminders, you can update your notification settings in your profile.
                </p>
              </div>
            `,
          })

          if (emailError) {
            throw emailError
          }

          remindersSent.push(user.email)
        }
      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError)
        errors.push({ userId: user.id, error: userError.message })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        remindersSent,
        errors,
        message: `Sent ${remindersSent.length} reminders`
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending workout reminders:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
        status: 500,
      }
    )
  }
})
