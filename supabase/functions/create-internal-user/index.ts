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
    if (roleCode !== 'ADMIN') throw new Error('Solo ADMIN puede crear usuarios internos.')

    const { data: actorProfileId, error: actorError } = await userClient.rpc('current_user_profile_id')
    if (actorError) throw actorError

    const payload = await req.json()
    const input = normalizePayload(payload)

    const { data: role, error: roleLookupError } = await adminClient
      .from('roles')
      .select('id, code, name')
      .eq('id', input.role_id)
      .eq('is_active', true)
      .single()

    if (roleLookupError) throw roleLookupError
    if (['OPERADOR', 'CONSULTA'].includes(role.code)) {
      throw new Error('El rol seleccionado ya no esta disponible.')
    }

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: input.institutional_email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        first_name: input.first_name,
        last_name: input.last_name,
      },
    })

    if (authError) throw authError

    const authUserId = authData.user?.id
    if (!authUserId) throw new Error('No se pudo obtener el usuario Auth creado.')

    const profilePayload = {
      auth_user_id: authUserId,
      role_id: input.role_id,
      first_name: input.first_name,
      last_name: input.last_name,
      institutional_email: input.institutional_email,
      dni: input.dni,
      is_active: input.is_active,
      notes: input.notes,
      created_by: actorProfileId,
    }

    const { data: profile, error: profileError } = await adminClient
      .from('user_profiles')
      .insert(profilePayload)
      .select('*, roles(code, name)')
      .single()

    if (profileError) {
      await adminClient.auth.admin.deleteUser(authUserId)
      throw profileError
    }

    await adminClient.from('audit_logs').insert({
      actor_user_id: actorProfileId,
      entity_name: 'user_profiles',
      entity_id: profile.id,
      action_type: 'create_internal_user',
      previous_data: null,
      new_data: sanitizeProfile(profile),
      summary: `Usuario interno creado: ${profile.first_name} ${profile.last_name}`,
      extra_meta: {
        source: 's13_user_generation',
        role_code: role.code,
        auth_user_id: authUserId,
      },
    })

    return jsonResponse({ profile })
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Error inesperado' },
      400
    )
  }
})

function normalizePayload(payload: Record<string, unknown>) {
  const firstName = String(payload.first_name || '').trim()
  const lastName = String(payload.last_name || '').trim()
  const email = String(payload.institutional_email || '').trim().toLowerCase()
  const dni = String(payload.dni || '').trim()
  const roleId = String(payload.role_id || '').trim()
  const password = String(payload.password || '')
  const notes = payload.notes ? String(payload.notes).trim() : null

  if (!firstName) throw new Error('Los nombres son obligatorios.')
  if (!lastName) throw new Error('Los apellidos son obligatorios.')
  if (!email) throw new Error('El correo institucional es obligatorio.')
  if (!dni) throw new Error('El DNI es obligatorio.')
  if (!roleId) throw new Error('El rol es obligatorio.')
  if (password.length < 8) throw new Error('La clave temporal debe tener al menos 8 caracteres.')

  return {
    first_name: firstName,
    last_name: lastName,
    institutional_email: email,
    dni,
    role_id: roleId,
    password,
    is_active: payload.is_active !== false,
    notes,
  }
}

function sanitizeProfile(profile: Record<string, unknown>) {
  const { auth_user_id: authUserId, ...rest } = profile
  return {
    ...rest,
    auth_user_id: authUserId,
  }
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}
