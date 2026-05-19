import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Variables SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas.')
    }

    const authorization = req.headers.get('Authorization')
    if (!authorization) throw new Error('Token de autorizacion requerido.')

    const userClient = createClient(
      supabaseUrl,
      serviceRoleKey,
      { global: { headers: { Authorization: authorization } } }
    )
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: roleCode, error: roleError } = await userClient.rpc('current_user_role_code')
    if (roleError) throw roleError
    if (roleCode !== 'ADMIN') throw new Error('Solo ADMIN puede restablecer contrasenas.')

    const { data: actorProfileId, error: actorError } = await userClient.rpc('current_user_profile_id')
    if (actorError) throw actorError

    const payload = await req.json()
    const userProfileId = String(payload.user_profile_id || '').trim()
    const password = String(payload.password || '')

    if (!userProfileId) throw new Error('El usuario objetivo es obligatorio.')
    if (password.length < 8) throw new Error('La clave temporal debe tener al menos 8 caracteres.')

    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles')
      .select('id, auth_user_id, first_name, last_name, institutional_email')
      .eq('id', userProfileId)
      .eq('is_deleted', false)
      .single()

    if (profileError) throw profileError

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      profile.auth_user_id,
      { password }
    )

    if (updateError) throw updateError

    await adminClient.from('audit_logs').insert({
      actor_user_id: actorProfileId,
      entity_name: 'user_profiles',
      entity_id: profile.id,
      action_type: 'reset_internal_user_password',
      previous_data: null,
      new_data: {
        user_profile_id: profile.id,
        institutional_email: profile.institutional_email,
      },
      summary: `Contrasena restablecida para ${profile.first_name} ${profile.last_name}`,
      extra_meta: {
        source: 's13_user_generation',
        password_changed: true,
      },
    })

    return jsonResponse({ ok: true })
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Error inesperado' },
      400
    )
  }
})

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}
