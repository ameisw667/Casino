import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Get the ID and type
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, username, first_name, last_name, image_url } = evt.data;
    const email = email_addresses[0]?.email_address;
    const displayName = username || `${first_name} ${last_name}`.trim() || 'Player';

    const supabase = createAdminClient();

    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: id,
          email: email,
          username: displayName,
          avatar_url: image_url,
          balance: 1000.00, // Starting balance
          xp: 0,
          level: 1,
          rank: 'BRONZE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error('Error creating user in Supabase:', error);
        return new Response('Database Error', { status: 500 });
      }

      console.log(`Successfully created user ${id} in Supabase`);
    } catch (err) {
      console.error('Unexpected error during Supabase sync:', err);
      return new Response('Sync Error', { status: 500 });
    }
  }

  return new Response('Webhook processed', { status: 200 });
}
