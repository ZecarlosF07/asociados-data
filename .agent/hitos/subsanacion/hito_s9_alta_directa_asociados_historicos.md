# Hito S9: Mejora post-release del Hito 5 - Alta directa de asociados históricos

## 1. Objetivo del hito

Implementar un flujo operativo para registrar asociados existentes de forma directa, uno por uno, sin obligar a crear prospectos ficticios. Este flujo debe permitir cargar la información histórica real de la organización manteniendo integridad, código interno único, validaciones, permisos, auditoría y compatibilidad con la ficha principal del asociado.

Este hito se considera una mejora funcional post-release del **Hito 5: Conversión a asociado y ficha principal**, porque agrega un segundo camino legítimo de creación de asociados:

- flujo normal: prospecto aprobado -> conversión a asociado
- flujo histórico: alta directa de asociado existente

## 2. Hito original que mejora

Este hito mejora el comportamiento del **Hito 5: Conversión a asociado y ficha principal**.

El Hito 5 exige:

- crear la tabla principal de asociados
- definir relación con prospecto de origen cuando corresponda
- desarrollar ficha principal del asociado
- permitir mantenimiento de información del asociado
- dejar al asociado listo para membresías, pagos, documentos y reportes

La frase clave es **cuando corresponda**: no todo asociado real debe tener un prospecto de origen. Para asociados históricos, crear un prospecto artificial ensucia la trazabilidad comercial y genera información falsa o incompleta.

## 3. Problema detectado

### 3.1 Necesidad operativa

La organización ya cuenta con asociados existentes y está en proceso de cargar información real al sistema. Si se obliga a registrar primero un prospecto para cada asociado histórico:

- se duplican pasos innecesarios
- se crean prospectos ficticios
- se distorsionan métricas de captación
- se mezclan procesos históricos con el flujo comercial actual
- se fuerza a registrar evaluación/cotización/historial que quizá nunca existió

### 3.2 Estado técnico actual

El modelo ya permite asociados sin prospecto:

```txt
associates.prospect_origin_id uuid null
```

La tabla `associates` exige:

- `internal_code`
- `associate_status_id`
- `ruc`
- `company_name`

El servicio actual tiene:

```txt
src/services/associates.service.js
```

con:

- `create(associate)`
- `update(...)`
- `convertFromProspect(...)`

Pero la UI actual no tiene ruta ni pantalla para crear asociado directo desde el módulo de asociados.

### 3.3 Riesgo técnico actual

Aunque `associatesService.create(...)` existe, no debe usarse de forma directa desde una pantalla sin resolver antes:

- generación segura de `internal_code`
- validación de RUC duplicado
- validación de estado de asociado
- validación de usuario responsable
- permisos reales de creación
- auditoría de alta directa
- manejo claro de errores

S2 ya implementó:

```sql
public.next_entity_code(...)
```

para generar códigos correlativos seguros con el formato anterior. S9 cambia la regla de negocio del código interno del asociado para que sea usable como identificador corto de intranet.

La nueva regla debe ser:

```txt
A + YY de fecha real de asociación + últimos 6 dígitos del RUC
```

Ejemplo:

```txt
Fecha de asociación: 2024-08-10
RUC: 20601234567
Código interno: A24234567
```

El año no debe salir del año de carga al sistema si existe una fecha real de asociación. Para socios históricos asociados desde 2024, el código debe iniciar con `A24`.

## 4. Alcance funcional

### 4.1 Alta directa desde módulo de asociados

Agregar una acción visible en el listado de asociados:

```txt
+ Nuevo asociado
```

Solo debe mostrarse a usuarios con permiso de creación sobre el módulo `asociados`.

Al hacer clic, debe abrir una pantalla de creación directa:

```txt
/asociados/nuevo
```

### 4.2 Formulario de asociado histórico

El formulario debe reutilizar `AssociateForm` cuando sea posible.

Debe permitir registrar:

- razón social
- RUC
- nombre comercial
- estado del asociado
- categoría
- fecha de asociación
- fecha de aniversario
- actividad económica
- tipo de actividad
- tamaño de empresa
- dirección
- correo corporativo
- teléfonos
- web
- responsable de afiliación
- captador si aplica
- libro/padrón
- bienvenida confirmada
- observaciones

No debe solicitar:

- prospecto origen obligatorio
- evaluación
- cotización
- historial comercial previo

### 4.3 Creación y navegación

Después de crear el asociado:

- mostrar notificación de éxito
- redirigir a la ficha del asociado creado
- permitir continuar con personas vinculadas, contactos, membresías y documentos desde la ficha

### 4.4 Diferenciación contra conversión

El sistema debe mantener separados los conceptos:

- asociado convertido: `prospect_origin_id` con valor
- asociado histórico/directo: `prospect_origin_id = null`

La ficha debe seguir funcionando aunque no exista `prospect_origin`.

Si se muestra una sección de "Origen prospecto", debe ocultarse o mostrar "Alta directa / Sin prospecto de origen" sin romper la UI.

## 5. Alcance técnico

### 5.1 RPC de alta directa

Crear una función SQL:

```sql
public.create_direct_associate(...)
```

Debe ejecutarse como `security definer` y utilizar una función centralizada de generación de código:

```sql
public.generate_associate_internal_code(p_ruc, p_association_date)
```

Debe:

- validar permiso `asociados:create`
- identificar `current_user_profile_id()`
- validar RUC obligatorio
- validar formato básico de RUC si se decide hacerlo en BD
- validar RUC único contra asociados activos
- validar estado de asociado activo y perteneciente a `ASSOCIATE_STATUS`
- validar categoría si se informa
- validar tipo de actividad si se informa
- validar tamaño de empresa si se informa
- validar responsable si se informa
- validar captador si se informa
- generar `internal_code` usando `A + YY de association_date + últimos 6 dígitos del RUC`
- insertar en `public.associates` con `prospect_origin_id = null`
- registrar auditoría
- retornar el asociado creado

No debe crear ni modificar prospectos.

### 5.1.1 Regla de código interno del asociado

Crear o reemplazar una función SQL:

```sql
public.generate_associate_internal_code(
  p_ruc text,
  p_association_date date
)
```

Debe retornar:

```txt
A + YY + last6(RUC)
```

Ejemplos:

| Fecha asociación | RUC | Código esperado |
|---|---|---|
| `2024-08-10` | `20601234567` | `A24234567` |
| `2026-05-15` | `20601234567` | `A26234567` |
| `2025-01-01` | `20123456789` | `A25456789` |

Reglas:

- `A` es prefijo fijo de asociado.
- `YY` son los dos últimos dígitos del año de `association_date`.
- `last6(RUC)` son los últimos 6 dígitos del RUC normalizado.
- El RUC debe limpiarse de espacios.
- El RUC debe tener 11 dígitos numéricos.
- `association_date` debe ser obligatoria para alta directa histórica.
- El código se genera solo en backend.
- El código debe mantenerse inmutable después de creado el asociado.
- Debe conservarse el índice único sobre `associates.internal_code`.

El formato anterior `ASO-YYYY-XXXX` queda reemplazado para nuevos asociados creados desde este hito.

### 5.1.2 Impacto sobre conversión prospecto -> asociado

Actualizar la RPC existente:

```sql
public.convert_prospect_to_associate(...)
```

para usar la misma función:

```sql
public.generate_associate_internal_code(p_ruc, p_association_date)
```

Esto evita que existan dos estándares de código:

- altas directas con `A24XXXXXX`
- conversiones con `ASO-2024-0001`

Desde S9, todo asociado nuevo debe usar el mismo formato `A + YY + last6(RUC)`.

`public.next_entity_code(...)` puede quedar disponible para otras entidades futuras, pero ya no debe usarse para generar códigos de asociados.

### 5.2 Servicio frontend

Actualizar:

```txt
src/services/associates.service.js
```

Agregar método:

```js
createDirectAssociate(payload)
```

Este método debe llamar la RPC `create_direct_associate` y luego recuperar el asociado completo con `getById(...)`.

No debe generar `internal_code` desde frontend.

Debe traducir errores frecuentes:

- RUC duplicado
- estado inválido
- permiso insuficiente
- usuario no identificado
- datos obligatorios faltantes

### 5.3 Ruta y pantalla de creación

Actualizar:

```txt
src/router/routes.js
src/router/AppRouter.jsx
```

Agregar ruta:

```txt
ASOCIADOS_NUEVO: /asociados/nuevo
```

Crear página:

```txt
src/pages/associates/AssociateCreatePage.jsx
```

Debe:

- renderizar `AssociateForm`
- usar `useUserProfile`
- usar `useNotification`
- llamar `associatesService.createDirectAssociate(...)`
- navegar a `/asociados/:id` al crear correctamente
- respetar `PermissionGuard module="asociados"`

### 5.4 Botón en listado

Actualizar:

```txt
src/pages/associates/AssociatesPage.jsx
```

Agregar botón:

```txt
+ Nuevo asociado
```

Debe mostrarse solo si el usuario tiene permiso de creación.

Reutilizar:

```txt
src/hooks/usePermissions.js
```

### 5.5 Formulario reusable

Actualizar:

```txt
src/components/molecules/associates/AssociateForm.jsx
```

Debe soportar modo creación y edición:

- en edición: botón `Guardar cambios`
- en creación: botón `Crear asociado`

El formulario no debe solicitar `internal_code`, porque se genera en backend.

### 5.6 Validaciones frontend

Actualizar:

```txt
src/utils/associateValidation.js
```

Validaciones mínimas:

- razón social obligatoria
- RUC obligatorio
- RUC de 11 dígitos
- estado de asociado obligatorio
- fecha de asociación obligatoria
- correo corporativo válido si se informa
- fecha de aniversario no anterior a fecha de asociación si ambas existen, si el negocio lo requiere

### 5.7 Auditoría y trazabilidad

La creación directa debe registrar en `audit_logs`:

- usuario actor
- entidad `associates`
- id del asociado creado
- acción `create_direct_associate`
- RUC
- código interno
- fecha de asociación
- origen `direct_historical_associate`

Esto permitirá distinguir el alta directa sin agregar campos nuevos al modelo.

## 6. Archivos principales a tocar

Frontend:

- `src/pages/associates/AssociatesPage.jsx`
- `src/pages/associates/AssociateCreatePage.jsx`
- `src/components/molecules/associates/AssociateForm.jsx`
- `src/services/associates.service.js`
- `src/utils/associateValidation.js`
- `src/router/routes.js`
- `src/router/AppRouter.jsx`

Backend/Supabase:

- nueva migración en `supabase/migrations`
- nuevo audit en `supabase/audits`

Audit sugerido:

```txt
supabase/audits/hito_s9_direct_associate_audit.sql
```

## 7. No crear prospectos artificiales

Regla explícita:

Para carga histórica de asociados existentes, no se debe crear un prospecto ficticio.

Solo debe usarse el flujo de prospecto cuando:

- el asociado nació de un proceso comercial nuevo
- existe trazabilidad real de captación/evaluación/cotización
- el prospecto fue aprobado y corresponde convertirlo

Para asociados ya existentes antes de la adopción del sistema, el camino correcto es alta directa.

## 8. Tareas para el desarrollador

1. Crear migración con RPC `create_direct_associate`.
2. Crear función `generate_associate_internal_code(p_ruc, p_association_date)`.
3. Generar `internal_code` con formato `A + YY + últimos 6 dígitos del RUC`.
4. Actualizar `convert_prospect_to_associate` para usar la misma función de código.
5. Validar permisos y usuario actor dentro de la RPC.
6. Validar duplicidad de RUC en backend.
7. Registrar auditoría con origen `direct_historical_associate`.
8. Crear audit SQL de verificación.
9. Agregar ruta `/asociados/nuevo`.
10. Crear `AssociateCreatePage`.
11. Actualizar `associatesService` con `createDirectAssociate`.
12. Ajustar `AssociateForm` para modo creación.
13. Agregar botón `Nuevo asociado` en el listado con control de permisos.
14. Probar alta directa exitosa.
15. Probar RUC duplicado.
16. Probar usuario sin permiso de creación.
17. Probar asociado creado sin `prospect_origin_id`.
18. Probar navegación a ficha y edición posterior.
19. Ejecutar `yarn lint`.
20. Ejecutar `yarn build`.

## 9. Casos de prueba obligatorios

### 9.1 Alta directa básica

Entrada:

- razón social válida
- RUC válido
- estado `ACTIVO`
- fecha de asociación

Resultado esperado:

- asociado creado
- `internal_code` generado en formato `A + YY + últimos 6 dígitos del RUC`
- `prospect_origin_id = null`
- redirección a ficha del asociado

Ejemplo:

```txt
Fecha de asociación: 2024-08-10
RUC: 20601234567
internal_code: A24234567
```

### 9.2 Alta directa con información completa

Entrada:

- datos empresariales
- categoría
- captador
- responsable
- contactos principales
- observaciones

Resultado esperado:

- la ficha muestra los datos registrados
- el asociado queda listo para registrar personas vinculadas, contactos por área, membresías y documentos

### 9.3 RUC duplicado

Entrada:

- RUC de un asociado activo existente

Resultado esperado:

- no se crea asociado
- se muestra mensaje claro de duplicidad
- no se genera un segundo asociado con el mismo RUC ni con el mismo código interno

### 9.4 Usuario sin permiso

Entrada:

- usuario sin permiso `asociados:create`

Resultado esperado:

- no ve botón `Nuevo asociado`
- si intenta llamar la RPC, recibe error de permiso

### 9.5 Ficha sin prospecto origen

Entrada:

- asociado creado por alta directa

Resultado esperado:

- la ficha carga sin errores
- no se muestra información de prospecto inexistente
- los módulos de membresías, pagos, documentos y contactos funcionan normalmente

## 10. Definition of Done

Este hito se considera terminado cuando:

- Existe flujo `/asociados/nuevo`.
- El usuario autorizado puede crear asociados directos sin crear prospectos.
- La fecha de asociación es obligatoria en alta directa.
- El `internal_code` se genera en backend con formato `A + YY + últimos 6 dígitos del RUC`.
- El `YY` se calcula desde `association_date`, no desde la fecha de carga.
- La conversión prospecto -> asociado usa el mismo formato de código.
- No se permite duplicar RUC activo.
- `prospect_origin_id` queda `null` para altas directas.
- La creación directa registra auditoría.
- La ficha del asociado funciona sin prospecto origen.
- El listado permite acceder al nuevo asociado.
- La edición posterior funciona.
- Existe audit SQL para validar la RPC y los registros creados.
- No se crean prospectos ficticios.
- `yarn lint` pasa.
- `yarn build` pasa.

## 11. Fuera de alcance

No forma parte de este hito:

- Importación masiva por Excel.
- Crear plantillas CSV/XLSX.
- Crear prospectos históricos retroactivos.
- Registrar membresía automáticamente al crear asociado.
- Registrar documentos automáticamente.
- Rediseñar la ficha completa del asociado.
- Cambiar el flujo de conversión prospecto -> asociado.
- Cambiar el modelo principal de `associates` salvo que se justifique técnicamente.
