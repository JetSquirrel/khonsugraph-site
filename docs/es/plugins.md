---
description: Crea un plugin de fuente de datos en cualquier lenguaje usando el protocolo JSON Lines.
---
# Desarrollo de plugins

Un plugin es un ejecutable separado que emite nodos y relaciones por stdin/stdout usando JSON Lines. El anfitrión escribe los registros en HawDB. Un plugin no necesita abrir el grafo por sí mismo.

El protocolo versión 1 es experimental y puede cambiar antes de 1.0. La [referencia completa del protocolo](https://github.com/JetSquirrel/KhonsuGraph/blob/main/docs/plugins.md) se mantiene junto con la aplicación.

## Estructura del paquete

```text
folders/
  khonsu-plugin.json
  plugin.py
```

```json
{
  "id": "folders",
  "name": "Folders",
  "version": "0.1.0",
  "protocol": 1,
  "entry": ["python3", "plugin.py"],
  "description": "A folder tree as nodes and CONTAINS relationships",
  "permissions": {"read_files": true, "commands": ["python3"]}
}
```

El ejecutable se ejecuta con la carpeta del plugin como su directorio de trabajo. El ejemplo completo más pequeño es el [plugin de carpetas en Python](https://github.com/JetSquirrel/KhonsuGraph/tree/main/examples/plugins/folders) del repositorio.

## Operaciones

| Operación | Entrada | Salida |
| --- | --- | --- |
| `describe` | Ninguna | Esquema de configuración, permisos y tipos de salida |
| `test` | Solicitud con configuración y secretos | `test_result` o `error` |
| `sync` | Solicitud con configuración, secretos, modo y cursor | Registros y progreso, luego `done` o `error` |

Cada mensaje es un objeto JSON en su propia línea con un campo `type`. Los diagnósticos van a stderr. Mantén los ID estables entre sincronizaciones; los extremos de las relaciones se refieren a ID de nodo de la misma fuente. Termina las sincronizaciones correctas con `done`.

## Permisos y secretos

Declara el acceso a la red, las lecturas de archivos y los comandos en el manifiesto. KhonsuGraph muestra estas declaraciones para su aprobación, pero **no** aísla el proceso. Marca los campos de configuración secretos con `secret: true` para usar el llavero del sistema.

Instala un directorio o ZIP de plugin después de revisarlo:

```sh
khonsu plugin install ./folders --yes
khonsu plugin describe folders
```

`--yes` aprueba los permisos declarados. El instalador copia el plugin; reinstálalo después de cambiar el código fuente. Consulta [semántica de sincronización](./data-sources#sync-semantics) antes de implementar la sincronización completa o incremental.
