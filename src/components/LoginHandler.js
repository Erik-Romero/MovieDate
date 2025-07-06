// LoginHandler.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function handleJoinGroup({ group, username }) {
  try {
    // Step 1: Ensure user exists (create if not)
    let { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('name', username)  // <- Use "name" instead of "username"
      .maybeSingle();

    if (userError) throw userError;

    let user;
    if (!existingUser) {
      const { data: newUser, error: newUserError } = await supabase
        .from('users')
        .insert({ name: username })  // <- Insert as "name"
        .select()
        .maybeSingle();
      if (newUserError) throw newUserError;
      user = newUser;
    } else {
      user = existingUser;
    }

    // Step 2: Ensure group exists (create if not)
    let { data: existingGroup, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('name', group)
      .maybeSingle();

    if (groupError) throw groupError;

    let groupData;
    if (!existingGroup) {
      const { data: newGroup, error: newGroupError } = await supabase
        .from('groups')
        .insert({ name: group })
        .select()
        .maybeSingle();
      if (newGroupError) throw newGroupError;
      groupData = newGroup;
    } else {
      groupData = existingGroup;
    }

    // Step 3: Ensure membership exists
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('group_id', groupData.id)
      .maybeSingle();

    if (memberError) throw memberError;

    if (!membership) {
      const { error: joinError } = await supabase.from('group_members').insert({
        user_id: user.id,
        group_id: groupData.id,
      });
      if (joinError) throw joinError;
    }

    return { userId: user.id, groupId: groupData.id };

  } catch (error) {
    console.error('Join error:', error.message);
    return { error: error.message };
  }
}
