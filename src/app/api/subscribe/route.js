export const runtime = 'edge';

export async function POST(request) {
  const {
    email,
    firstName,
    country,
    gender,
    yearOfBirth,
    researchTopics,
    signupSource,
  } = await request.json();

  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'A valid email is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { MAILCHIMP_API_KEY, MAILCHIMP_AUDIENCE_ID, MAILCHIMP_SERVER_PREFIX } =
    process.env;

  if (
    !MAILCHIMP_API_KEY ||
    !MAILCHIMP_AUDIENCE_ID ||
    !MAILCHIMP_SERVER_PREFIX
  ) {
    console.error('Mailchimp environment variables are not configured.');
    return new Response(
      JSON.stringify({
        error:
          'The subscription service is not available at the moment. Please try again later.',
      }),
      {
        status: 503, // Service Unavailable
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const merge_fields = {};
  if (firstName) merge_fields.FNAME = firstName;
  // For custom fields like Gender, Year of Birth, and Interests,
  // you must define corresponding Merge Tags in your Mailchimp Audience settings.
  // e.g., GENDER, YOB, TOPICS
  if (gender) merge_fields.GENDER = gender;
  if (yearOfBirth) merge_fields.YOB = Number(yearOfBirth);
  if (researchTopics) merge_fields.TOPICS = researchTopics;
  if (country && country.length > 0) merge_fields.COUNTRY = country.join(', ');

  // Apply Double Opt-In globally for maximum privacy compliance
  const subscriberStatus = 'pending';

  const data = {
    email_address: email,
    status: subscriberStatus,
    merge_fields,
  };

  if (signupSource) {
    data.tags = [signupSource];
  }

  try {
    const response = await fetch(
      `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`,
      {
        body: JSON.stringify(data),
        headers: {
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Mailchimp API error:', responseData);
      // Provide a user-friendly error from Mailchimp if available
      const errorMessage =
        responseData.title === 'Member Exists'
          ? 'This email is already subscribed.'
          : responseData.detail || 'An error occurred during subscription.';

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const successMessage =
      'Thank you for subscribing! Please check your email to confirm.';

    return new Response(JSON.stringify({ message: successMessage }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Internal server error:', error);
    return new Response(
      JSON.stringify({
        error: 'An internal error occurred. Please try again later.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
