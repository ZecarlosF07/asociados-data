# Diccionario de Tablas – Sistema de Asociados v2
## Modelo técnico refinado para React + Supabase

## 1. Propósito del documento
Este documento define la propuesta de modelo relacional refinado para el **Sistema de Asociados**, considerando las decisiones técnicas ya establecidas para el proyecto:

- React en frontend
- Supabase como backend, base de datos y storage
- consultas directas a Supabase como estrategia principal
- API Routes solo en casos estrictamente necesarios
- Atomic Design en frontend
- uso obligatorio de **soft delete** en entidades operativas que deban preservar historial
- separación entre **catálogos simples** y **entidades reales del negocio**

Este documento reemplaza conceptualmente el esquema inicial genérico y deja más claro qué elementos deben vivir como tabla propia y cuáles deben mantenerse como catálogos simples.

---

## 2. Criterio general del modelo

### 2.1 Catálogos simples
Se manejarán mediante:
- `catalog_groups`
- `catalog_items`

Estos catálogos solo deben usarse para listas simples, estables y sin vida propia de negocio.

Ejemplos válidos:
- estados
- tipos básicos
- áreas
- medios de contacto
- métodos de pago
- tamaños de empresa
- tipos de actividad
- estados técnicos

### 2.2 Entidades de negocio
Deben ser tablas propias cuando tengan:
- más campos propios
- reglas de negocio
- relaciones múltiples
- historial o trazabilidad
- crecimiento futuro probable
- uso importante en reportes

Ejemplos en este sistema:
- `categories`
- `associates`
- `prospects`
- `memberships`
- `benefits` (futuro)
- `services` (futuro)
- `committees`
- `documents`

---

## 3. Convenciones técnicas generales

## 3.1 Identificadores
Todas las tablas principales usarán:
- `id uuid primary key`

## 3.2 Auditoría base
Las tablas operativas deben contemplar, según corresponda:
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `created_by uuid null`
- `updated_by uuid null`

## 3.3 Soft delete
Las tablas operativas que deban preservar historial deben incluir:
- `is_deleted boolean not null default false`
- `deleted_at timestamptz null`
- `deleted_by uuid null`

### 3.3.1 Regla operativa
Toda consulta funcional del sistema debe filtrar por:
- `is_deleted = false`

## 3.4 Tipos usados
Se asumen tipos PostgreSQL / Supabase:
- `uuid`
- `varchar(n)`
- `text`
- `boolean`
- `smallint`
- `integer`
- `bigint`
- `numeric(12,2)`
- `numeric(5,2)`
- `date`
- `timestamptz`
- `jsonb`
- `inet`

---

# 4. Diccionario de tablas

## 4.1 roles
Define los rangos o perfiles funcionales del sistema.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador del rol |
| code | varchar(50) | No | UQ | Código interno. Ej.: ADMIN |
| name | varchar(100) | No |  | Nombre visible |
| description | text | Sí |  | Descripción funcional |
| is_active | boolean | No |  | Estado del rol |
| is_system | boolean | No |  | Si es rol base del sistema |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |

### Observaciones
- Tabla maestra de seguridad funcional.
- No requiere soft delete si se administra por desactivación.

---

## 4.2 user_profiles
Perfil interno del usuario autenticado.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador del perfil |
| auth_user_id | uuid | No | UQ | Relación con usuario de autenticación |
| role_id | uuid | No | FK | FK → `roles.id` |
| first_name | varchar(120) | No |  | Nombres |
| last_name | varchar(120) | No |  | Apellidos |
| institutional_email | varchar(180) | No | UQ | Correo institucional |
| dni | varchar(20) | No | UQ | Documento de identidad |
| is_active | boolean | No |  | Estado operativo |
| last_login_at | timestamptz | Sí |  | Último acceso |
| notes | text | Sí |  | Observaciones |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

### Observaciones
- Debe existir solo un administrador activo si así lo exige la regla final del sistema.

---

## 4.3 catalog_groups
Agrupa los tipos de catálogos simples.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| code | varchar(80) | No | UQ | Código del grupo |
| name | varchar(120) | No |  | Nombre del grupo |
| description | text | Sí |  | Descripción |
| is_active | boolean | No |  | Estado |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |

### Ejemplos de grupos
- PROSPECT_STATUS
- ASSOCIATE_STATUS
- MEMBERSHIP_STATUS
- PAYMENT_METHOD
- CONTACT_TYPE
- COMPANY_SIZE
- ACTIVITY_TYPE
- DOCUMENT_TYPE
- COLLECTION_STATUS
- SERVICE_STATUS

---

## 4.4 catalog_items
Valores de los catálogos simples.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| group_id | uuid | No | FK | FK → `catalog_groups.id` |
| code | varchar(80) | No |  | Código interno |
| label | varchar(150) | No |  | Etiqueta visible |
| sort_order | integer | No |  | Orden visual |
| meta | jsonb | Sí |  | Metadatos auxiliares |
| is_active | boolean | No |  | Activo / inactivo |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| is_deleted | boolean | No |  | Soft delete si el catálogo es administrable |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

### Observaciones
- Solo debe usarse para listas simples.
- No debe usarse para categorías, beneficios o servicios si estos tendrán lógica propia.

---

## 4.5 categories
Categorías del asociado o del prospecto.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| code | varchar(50) | No | UQ | Código interno |
| name | varchar(120) | No |  | Nombre de la categoría |
| description | text | Sí |  | Descripción |
| min_score | numeric(5,2) | Sí |  | Puntaje mínimo referencial |
| max_score | numeric(5,2) | Sí |  | Puntaje máximo referencial |
| base_fee | numeric(12,2) | Sí |  | Tarifa base |
| sort_order | integer | No |  | Orden visual |
| is_active | boolean | No |  | Estado |
| notes | text | Sí |  | Observaciones |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

### Observaciones
- Tabla propia porque la categoría puede crecer en reglas, beneficios, vigencias y reportes.

---

## 4.6 prospects
Empresas prospecto aún no convertidas en asociadas.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| company_name | varchar(220) | No |  | Razón social |
| trade_name | varchar(220) | Sí |  | Nombre comercial |
| ruc | varchar(20) | Sí | UQ parcial | RUC opcional al inicio |
| economic_activity | varchar(180) | Sí |  | Actividad económica |
| activity_type_id | uuid | Sí | FK | FK → `catalog_items.id` |
| company_size_id | uuid | Sí | FK | FK → `catalog_items.id` |
| primary_email | varchar(180) | Sí |  | Correo principal |
| contact_name | varchar(180) | Sí |  | Contacto principal |
| contact_position | varchar(120) | Sí |  | Cargo |
| contact_phone | varchar(30) | Sí |  | Teléfono o celular |
| captured_by_user_id | uuid | Sí | FK | FK → `user_profiles.id` |
| prospect_status_id | uuid | No | FK | FK → `catalog_items.id` |
| current_category_id | uuid | Sí | FK | FK → `categories.id` |
| suggested_fee | numeric(12,2) | Sí |  | Tarifa sugerida |
| negotiated_fee | numeric(12,2) | Sí |  | Tarifa negociada |
| source | varchar(120) | Sí |  | Procedencia |
| notes | text | Sí |  | Observaciones |
| converted_to_associate_id | uuid | Sí | FK | FK → `associates.id` |
| converted_at | timestamptz | Sí |  | Fecha de conversión |
| discarded_reason | text | Sí |  | Motivo de descarte |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

### Observaciones
- Debe conservar historial incluso si luego se convierte en socio.

---

## 4.7 prospect_evaluations
Evaluaciones de membresía realizadas al prospecto.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| prospect_id | uuid | No | FK | FK → `prospects.id` |
| export_import_score | smallint | No |  | Puntaje 0..3 |
| social_participation_score | smallint | No |  | Puntaje 0..3 |
| innovation_score | smallint | No |  | Puntaje 0..3 |
| prico_score | smallint | No |  | Puntaje 0..3 |
| market_size_score | smallint | No |  | Puntaje 0..3 |
| growth_opportunity_score | smallint | No |  | Puntaje 0..3 |
| representative_company_score | smallint | No |  | Puntaje 0..3 |
| qualified_staff_score | smallint | No |  | Puntaje 0..3 |
| competitive_advantage_score | smallint | No |  | Puntaje 0..3 |
| average_score | numeric(5,2) | No |  | Promedio final |
| suggested_category_id | uuid | Sí | FK | FK → `categories.id` |
| suggested_fee | numeric(12,2) | Sí |  | Tarifa sugerida |
| observations | text | Sí |  | Observaciones |
| is_current | boolean | No |  | Marca la evaluación vigente |
| created_at | timestamptz | No |  | Fecha de creación |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

### Observaciones
- Debe existir como historial de evaluación, no solo como valor actual.

---

## 4.8 prospect_quotes
Cotizaciones emitidas a prospectos.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| prospect_id | uuid | No | FK | FK → `prospects.id` |
| quote_number | varchar(40) | No | UQ | Correlativo |
| issue_date | date | No |  | Fecha de emisión |
| expiration_date | date | Sí |  | Fecha de vencimiento |
| category_id | uuid | Sí | FK | FK → `categories.id` |
| quoted_amount | numeric(12,2) | No |  | Monto cotizado |
| currency_code | varchar(10) | No |  | Moneda |
| quote_status_id | uuid | No | FK | FK → `catalog_items.id` |
| sent_at | timestamptz | Sí |  | Fecha de envío |
| sent_to_email | varchar(180) | Sí |  | Correo destino |
| pdf_document_id | uuid | Sí | FK | FK → `documents.id` |
| notes | text | Sí |  | Observaciones |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

## 4.9 prospect_status_history
Historial de cambios de estado del prospecto.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| prospect_id | uuid | No | FK | FK → `prospects.id` |
| previous_status_id | uuid | Sí | FK | FK → `catalog_items.id` |
| new_status_id | uuid | No | FK | FK → `catalog_items.id` |
| change_reason | text | Sí |  | Motivo del cambio |
| changed_at | timestamptz | No |  | Fecha de cambio |
| changed_by | uuid | Sí | FK | FK → `user_profiles.id` |
| notes | text | Sí |  | Observaciones |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

## 4.10 associates
Ficha principal de la empresa asociada.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| internal_code | varchar(30) | No | UQ | Código interno |
| book_registry | varchar(80) | Sí |  | Libro o padrón |
| welcome_status | boolean | No |  | Confirmación de bienvenida |
| affiliation_responsible_user_id | uuid | Sí | FK | FK → `user_profiles.id` |
| category_id | uuid | Sí | FK | FK → `categories.id` |
| associate_status_id | uuid | No | FK | FK → `catalog_items.id` |
| ruc | varchar(20) | No | UQ | RUC único |
| company_name | varchar(220) | No |  | Razón social |
| trade_name | varchar(220) | Sí |  | Nombre comercial |
| address | text | Sí |  | Dirección |
| association_date | date | Sí |  | Fecha de asociación |
| anniversary_date | date | Sí |  | Fecha de aniversario |
| landline_phone | varchar(30) | Sí |  | Teléfono fijo |
| mobile_phone_1 | varchar(30) | Sí |  | Celular 1 |
| mobile_phone_2 | varchar(30) | Sí |  | Celular 2 |
| corporate_email | varchar(180) | Sí |  | Correo corporativo |
| website | varchar(220) | Sí |  | Página web |
| economic_activity | varchar(180) | Sí |  | Actividad |
| activity_type_id | uuid | Sí | FK | FK → `catalog_items.id` |
| company_size_id | uuid | Sí | FK | FK → `catalog_items.id` |
| prospect_origin_id | uuid | Sí | FK | FK → `prospects.id` |
| inactivation_reason | text | Sí |  | Motivo de inactivación |
| inactivated_at | timestamptz | Sí |  | Fecha de inactivación |
| last_interaction_at | timestamptz | Sí |  | Última interacción |
| compliance_percentage | numeric(5,2) | Sí |  | Cumplimiento |
| payment_health_status_id | uuid | Sí | FK | FK → `catalog_items.id` |
| notes | text | Sí |  | Observaciones generales |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

### Observaciones
- Entidad principal del negocio.
- No debe sobrecargarse con todos los contactos o personas dentro de la misma tabla.

---

## 4.11 associate_people
Personas principales vinculadas al asociado.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| associate_id | uuid | No | FK | FK → `associates.id` |
| person_role_id | uuid | No | FK | FK → `catalog_items.id` |
| full_name | varchar(180) | No |  | Nombre completo |
| position | varchar(120) | Sí |  | Cargo |
| email | varchar(180) | Sí |  | Correo |
| dni | varchar(20) | Sí |  | DNI |
| phone | varchar(30) | Sí |  | Teléfono |
| birthday | date | Sí |  | Onomástico |
| is_primary | boolean | No |  | Marca principal del tipo |
| notes | text | Sí |  | Observaciones |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

## 4.12 associate_area_contacts
Contactos por área del asociado.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| associate_id | uuid | No | FK | FK → `associates.id` |
| area_id | uuid | No | FK | FK → `catalog_items.id` |
| full_name | varchar(180) | No |  | Nombre completo |
| position | varchar(120) | Sí |  | Cargo |
| email | varchar(180) | Sí |  | Correo |
| phone | varchar(30) | Sí |  | Teléfono |
| is_primary | boolean | No |  | Contacto principal del área |
| notes | text | Sí |  | Observaciones |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

## 4.13 memberships
Membresías del asociado.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| associate_id | uuid | No | FK | FK → `associates.id` |
| membership_type_id | uuid | No | FK | FK → `catalog_items.id` |
| category_id | uuid | Sí | FK | FK → `categories.id` |
| fee_amount | numeric(12,2) | No |  | Tarifa final |
| currency_code | varchar(10) | No |  | Moneda |
| start_date | date | No |  | Inicio |
| monthly_billing_day | smallint | Sí |  | Día de cobro si es mensual |
| end_date | date | Sí |  | Fin |
| membership_status_id | uuid | No | FK | FK → `catalog_items.id` |
| negotiation_notes | text | Sí |  | Notas de negociación |
| is_current | boolean | No |  | Membresía vigente |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

## 4.14 payment_schedules
Programación esperada de pagos.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| membership_id | uuid | No | FK | FK → `memberships.id` |
| associate_id | uuid | No | FK | FK → `associates.id` |
| due_date | date | No |  | Fecha esperada |
| period_year | integer | No |  | Año |
| period_month | smallint | Sí |  | Mes si aplica |
| expected_amount | numeric(12,2) | No |  | Importe esperado |
| collection_status_id | uuid | No | FK | FK → `catalog_items.id` |
| is_paid | boolean | No |  | Si fue cubierto |
| paid_at | timestamptz | Sí |  | Fecha de pago total |
| payment_health_status_id | uuid | Sí | FK | FK → `catalog_items.id` |
| notes | text | Sí |  | Observaciones |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

### Observaciones
- Al inactivar un socio, los pagos futuros deben anularse o eliminarse lógicamente según la regla técnica final.

---

## 4.15 payments
Pagos registrados realmente.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| associate_id | uuid | No | FK | FK → `associates.id` |
| membership_id | uuid | Sí | FK | FK → `memberships.id` |
| payment_schedule_id | uuid | Sí | FK | FK → `payment_schedules.id` |
| payment_date | date | No |  | Fecha de pago |
| amount_paid | numeric(12,2) | No |  | Monto pagado |
| currency_code | varchar(10) | No |  | Moneda |
| operation_code | varchar(120) | No |  | Código de operación |
| payment_method_id | uuid | Sí | FK | FK → `catalog_items.id` |
| reference_notes | text | Sí |  | Observaciones |
| registered_by_user_id | uuid | Sí | FK | FK → `user_profiles.id` |
| is_reversed | boolean | No |  | Marca de reversa |
| reversed_at | timestamptz | Sí |  | Fecha reversa |
| reversal_reason | text | Sí |  | Motivo |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

## 4.16 collection_actions
Gestiones de cobranza realizadas.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| associate_id | uuid | No | FK | FK → `associates.id` |
| payment_schedule_id | uuid | Sí | FK | FK → `payment_schedules.id` |
| action_date | timestamptz | No |  | Fecha y hora |
| managed_by_user_id | uuid | No | FK | FK → `user_profiles.id` |
| contact_type_id | uuid | No | FK | FK → `catalog_items.id` |
| subject | varchar(200) | No |  | Asunto |
| short_observation | text | Sí |  | Observación breve |
| mail_to | varchar(180) | Sí |  | Correo si aplica |
| action_result_id | uuid | Sí | FK | FK → `catalog_items.id` |
| next_follow_up_at | timestamptz | Sí |  | Próximo seguimiento |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

## 4.17 committees
Comités institucionales.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| code | varchar(50) | Sí | UQ | Código opcional |
| name | varchar(180) | No |  | Nombre del comité |
| description | text | Sí |  | Descripción |
| is_active | boolean | No |  | Estado |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

## 4.18 associate_committees
Relación entre asociado y comité.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| associate_id | uuid | No | FK | FK → `associates.id` |
| committee_id | uuid | No | FK | FK → `committees.id` |
| joined_at | date | Sí |  | Fecha de incorporación |
| left_at | date | Sí |  | Fecha de salida |
| is_active | boolean | No |  | Estado del vínculo |
| notes | text | Sí |  | Observaciones |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

## 4.19 committee_meetings
Reuniones de comité.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| committee_id | uuid | No | FK | FK → `committees.id` |
| title | varchar(220) | No |  | Título de la reunión |
| meeting_date | date | Sí |  | Fecha |
| period_year | integer | Sí |  | Año |
| period_month | smallint | Sí |  | Mes |
| summary_ai | text | Sí |  | Resumen generado por IA |
| summary_generated_at | timestamptz | Sí |  | Fecha de generación |
| summary_status_id | uuid | Sí | FK | FK → `catalog_items.id` |
| notes | text | Sí |  | Observaciones |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

## 4.20 storage_nodes
Árbol lógico del módulo de almacenamiento.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| parent_id | uuid | Sí | FK | FK → `storage_nodes.id` |
| node_type_id | uuid | No | FK | FK → `catalog_items.id` |
| name | varchar(180) | No |  | Nombre del nodo |
| slug | varchar(180) | Sí |  | Nombre técnico |
| sort_order | integer | No |  | Orden |
| associate_id | uuid | Sí | FK | FK → `associates.id` |
| committee_id | uuid | Sí | FK | FK → `committees.id` |
| year_number | integer | Sí |  | Año |
| month_number | smallint | Sí |  | Mes |
| is_system_generated | boolean | No |  | Generado automáticamente |
| notes | text | Sí |  | Observaciones |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

## 4.21 documents
Metadatos de archivo almacenado en Supabase Storage.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| storage_node_id | uuid | Sí | FK | FK → `storage_nodes.id` |
| associate_id | uuid | Sí | FK | FK → `associates.id` |
| prospect_id | uuid | Sí | FK | FK → `prospects.id` |
| committee_id | uuid | Sí | FK | FK → `committees.id` |
| committee_meeting_id | uuid | Sí | FK | FK → `committee_meetings.id` |
| document_category_id | uuid | Sí | FK | FK → `catalog_items.id` |
| document_type_id | uuid | Sí | FK | FK → `catalog_items.id` |
| title | varchar(220) | No |  | Nombre visible |
| original_filename | varchar(255) | No |  | Nombre original |
| storage_bucket | varchar(100) | No |  | Bucket |
| storage_path | text | No | UQ | Ruta física |
| mime_type | varchar(120) | Sí |  | Tipo MIME |
| file_extension | varchar(20) | Sí |  | Extensión |
| size_bytes | bigint | Sí |  | Tamaño |
| version_number | integer | No |  | Versión lógica |
| replaces_document_id | uuid | Sí | FK | FK → `documents.id` |
| is_latest_version | boolean | No |  | Última versión |
| uploaded_by_user_id | uuid | Sí | FK | FK → `user_profiles.id` |
| uploaded_at | timestamptz | No |  | Fecha de carga |
| mirror_drive_status_id | uuid | Sí | FK | FK → `catalog_items.id` |
| mirror_drive_path | text | Sí |  | Ruta espejo |
| notes | text | Sí |  | Observaciones |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

## 4.22 benefits
Tabla futura para beneficios del asociado.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| code | varchar(50) | No | UQ | Código |
| name | varchar(180) | No |  | Nombre del beneficio |
| description | text | Sí |  | Descripción |
| benefit_type_id | uuid | Sí | FK | FK → `catalog_items.id` |
| usage_mode | varchar(50) | Sí |  | Modo de uso |
| max_uses | integer | Sí |  | Máximo de usos |
| valid_from | date | Sí |  | Inicio de vigencia |
| valid_until | date | Sí |  | Fin de vigencia |
| requires_approval | boolean | No |  | Requiere aprobación |
| is_active | boolean | No |  | Estado |
| notes | text | Sí |  | Observaciones |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

### Observaciones
- Tabla propia porque el beneficio puede crecer en reglas y trazabilidad.

---

## 4.23 category_benefits
Beneficios asociados a una categoría.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| category_id | uuid | No | FK | FK → `categories.id` |
| benefit_id | uuid | No | FK | FK → `benefits.id` |
| is_included | boolean | No |  | Marca de inclusión |
| notes | text | Sí |  | Observaciones |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

## 4.24 associate_benefit_usages
Registro de uso real de beneficios por asociado.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| associate_id | uuid | No | FK | FK → `associates.id` |
| benefit_id | uuid | No | FK | FK → `benefits.id` |
| usage_date | date | No |  | Fecha de uso |
| quantity | integer | Sí |  | Cantidad |
| detail | text | Sí |  | Detalle |
| registered_by | uuid | Sí | FK | FK → `user_profiles.id` |
| notes | text | Sí |  | Observaciones |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

## 4.25 services
Tabla futura para servicios institucionales.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| code | varchar(50) | No | UQ | Código |
| name | varchar(180) | No |  | Nombre del servicio |
| description | text | Sí |  | Descripción |
| service_type_id | uuid | Sí | FK | FK → `catalog_items.id` |
| responsible_area_id | uuid | Sí | FK | FK → `catalog_items.id` |
| is_active | boolean | No |  | Estado |
| notes | text | Sí |  | Observaciones |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

### Observaciones
- Tabla propia porque el servicio puede tener reglas, responsables, estados y trazabilidad futura.

---

## 4.26 associate_service_usages
Registro de consumo o uso de servicios por asociado.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| associate_id | uuid | No | FK | FK → `associates.id` |
| service_id | uuid | No | FK | FK → `services.id` |
| requested_at | timestamptz | Sí |  | Fecha de solicitud |
| attended_at | timestamptz | Sí |  | Fecha de atención |
| service_status_id | uuid | Sí | FK | FK → `catalog_items.id` |
| observations | text | Sí |  | Observaciones |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

## 4.27 drive_sync_jobs
Registro técnico de sincronización hacia Google Drive.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| job_type | varchar(50) | No |  | Tipo de trabajo |
| job_status_id | uuid | No | FK | FK → `catalog_items.id` |
| started_at | timestamptz | Sí |  | Inicio |
| finished_at | timestamptz | Sí |  | Fin |
| processed_count | integer | No |  | Procesados |
| success_count | integer | No |  | Exitosos |
| error_count | integer | No |  | Errores |
| payload | jsonb | Sí |  | Configuración del lote |
| result_summary | text | Sí |  | Resumen |
| triggered_by_user_id | uuid | Sí | FK | FK → `user_profiles.id` |
| created_at | timestamptz | No |  | Fecha de creación |

### Observaciones
- Tabla técnica.
- No requiere soft delete normalmente.

---

## 4.28 audit_logs
Bitácora global de auditoría.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| event_at | timestamptz | No |  | Fecha del evento |
| actor_user_id | uuid | Sí | FK | FK → `user_profiles.id` |
| entity_name | varchar(120) | No |  | Tabla o entidad afectada |
| entity_id | uuid | Sí |  | Identificador afectado |
| action_type | varchar(60) | No |  | Tipo de acción |
| previous_data | jsonb | Sí |  | Estado anterior |
| new_data | jsonb | Sí |  | Estado nuevo |
| summary | text | Sí |  | Resumen legible |
| ip_address | inet | Sí |  | IP |
| user_agent | text | Sí |  | Agente de usuario |
| extra_meta | jsonb | Sí |  | Metadatos |

### Observaciones
- No debe usar soft delete.
- Es parte de la trazabilidad permanente del sistema.

---

## 4.29 system_settings
Configuraciones globales administrables.

| Campo | Tipo | Nulo | Clave | Detalle |
|---|---|---:|---|---|
| id | uuid | No | PK | Identificador |
| setting_key | varchar(120) | No | UQ | Clave única |
| setting_value | jsonb | No |  | Valor |
| description | text | Sí |  | Descripción |
| is_public | boolean | No |  | Si puede leerse desde frontend |
| created_at | timestamptz | No |  | Fecha de creación |
| updated_at | timestamptz | No |  | Fecha de actualización |
| created_by | uuid | Sí | FK | FK → `user_profiles.id` |
| updated_by | uuid | Sí | FK | FK → `user_profiles.id` |
| is_deleted | boolean | No |  | Soft delete |
| deleted_at | timestamptz | Sí |  | Fecha de borrado lógico |
| deleted_by | uuid | Sí | FK | FK → `user_profiles.id` |

---

# 5. Resumen de relaciones clave

## Prospectos
- `prospects` 1:N `prospect_evaluations`
- `prospects` 1:N `prospect_quotes`
- `prospects` 1:N `prospect_status_history`
- `prospects` 0..1:1 `associates` como conversión

## Categorías
- `categories` 1:N `prospects`
- `categories` 1:N `prospect_evaluations`
- `categories` 1:N `prospect_quotes`
- `categories` 1:N `associates`
- `categories` 1:N `memberships`
- `categories` N:M `benefits` vía `category_benefits`

## Asociados
- `associates` 1:N `associate_people`
- `associates` 1:N `associate_area_contacts`
- `associates` 1:N `memberships`
- `associates` 1:N `payment_schedules`
- `associates` 1:N `payments`
- `associates` 1:N `collection_actions`
- `associates` N:M `committees` vía `associate_committees`
- `associates` 1:N `documents`
- `associates` 1:N `associate_benefit_usages`
- `associates` 1:N `associate_service_usages`

## Documentos y almacenamiento
- `storage_nodes` árbol jerárquico
- `storage_nodes` 1:N `documents`
- `committee_meetings` 1:N `documents`
- `documents` puede versionarse contra sí misma

## Futuro crecimiento
- `benefits` y `services` quedan como módulos extensibles
- `catalog_items` queda reservado para listas simples

---

# 6. Conclusión técnica
Este modelo refinado busca evitar dos problemas comunes:

1. sobrecargar una tabla genérica de catálogos con conceptos que en realidad tienen vida propia de negocio
2. dejar demasiadas constantes duras en frontend que luego obliguen a rediseñar la aplicación

La propuesta final deja una base más sana para crecer hacia:
- beneficios
- servicios
- nuevas reglas por categoría
- reportes más complejos
- historial de uso
- automatizaciones futuras

Todo ello manteniendo:
- modularidad
- trazabilidad
- soft delete
- compatibilidad con React + Supabase
- crecimiento progresivo del sistema

