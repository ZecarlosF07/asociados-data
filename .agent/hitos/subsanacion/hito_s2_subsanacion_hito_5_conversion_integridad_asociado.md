# Hito S2: Subsanación del Hito 5 - Conversión e integridad del asociado

## 1. Objetivo del hito

Cerrar riesgos de integridad en el proceso de conversión de prospecto a asociado y fortalecer al asociado como entidad central del sistema. La conversión debe ser atómica, segura contra duplicados y consistente incluso ante errores parciales o concurrencia.

## 2. Hito original que subsana

Este hito subsana el **Hito 5: Conversión a asociado y ficha principal**.

El Hito 5 exige:

- convertir prospectos aprobados en asociados
- evitar conversiones duplicadas
- registrar relación entre prospecto y asociado
- conservar trazabilidad
- dejar al asociado listo para módulos posteriores

La brecha principal es que la conversión se realiza en dos pasos desde el servicio frontend, sin transacción explícita.

## 3. Problemas detectados

- La conversión crea el asociado y luego actualiza el prospecto.
- Si falla la actualización del prospecto, puede quedar un asociado creado sin relación inversa correcta.
- La generación de código `ASO-YYYY-XXXX` basada en conteo puede fallar con concurrencia.
- La prevención de duplicados depende en parte de la interfaz y validaciones de aplicación.
- Faltan garantías fuertes de base de datos para evitar dos asociados del mismo prospecto.

## 4. Alcance técnico

### 4.1 Conversión transaccional

Crear RPC:

```sql
public.convert_prospect_to_associate(...)
```

Debe hacer en una sola transacción:

- validar que el prospecto existe
- validar que no está eliminado
- validar que está aprobado
- validar que no fue convertido
- crear asociado
- actualizar prospecto con `converted_to_associate_id`
- actualizar `converted_at`
- registrar auditoría
- retornar el asociado creado

### 4.2 Restricciones de duplicidad

Agregar constraints o índices únicos:

- un prospecto solo puede originar un asociado activo
- un asociado activo no debe duplicar RUC
- el código interno debe ser único

Considerar índices parciales para respetar soft delete:

```sql
where is_deleted = false
```

### 4.3 Código correlativo seguro

Reemplazar generación basada en `count(*)` por:

- secuencia anual
- tabla `entity_counters`
- función SQL con bloqueo transaccional

Debe soportar formato:

```text
ASO-YYYY-XXXX
```

### 4.4 Ajustes frontend

Actualizar `associates.service.js`:

- reemplazar lógica local de conversión por llamada RPC
- eliminar generación de código desde frontend
- manejar errores específicos:
  - prospecto no aprobado
  - prospecto ya convertido
  - RUC duplicado
  - permiso insuficiente

### 4.5 Trazabilidad

Registrar en auditoría:

- usuario que convierte
- prospecto origen
- asociado destino
- fecha
- payload mínimo de conversión

## 5. Tareas para el desarrollador

1. Crear migración para contador o secuencia de asociados.
2. Crear función SQL para generar código de asociado.
3. Crear RPC de conversión.
4. Agregar constraints o índices parciales necesarios.
5. Actualizar servicio frontend para usar RPC.
6. Ajustar modal de conversión para mostrar errores claros.
7. Probar conversión exitosa.
8. Probar intento de doble conversión.
9. Probar error forzado y validar rollback.
10. Probar concurrencia básica si es posible.

## 6. Definition of Done

Este hito se considera terminado cuando:

- La conversión prospecto-asociado es transaccional.
- No puede haber dos asociados activos desde el mismo prospecto.
- El código del asociado se genera de forma segura ante concurrencia.
- La relación prospecto/asociado queda consistente en ambos sentidos.
- Los errores se muestran claramente al usuario.
- La auditoría registra la conversión.
- `yarn lint` y `yarn build` pasan.

