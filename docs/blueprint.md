# **App Name**: GiftMatch

## Core Features:

- Autenticación de Usuario: Registro e inicio de sesión seguros con verificación de correo electrónico, cifrado de contraseñas y recuperación de contraseñas mediante código enviado por correo electrónico.
- Gestión de Perfil: Los usuarios pueden ver y editar su información de perfil (correo electrónico, nombre, dirección, etc.).
- Creación de Lista de Deseos: Los usuarios pueden crear y gestionar una lista de deseos de regalos deseados con descripciones y (opcionalmente) enlaces a lugares de compra.
- Asignación de Amigo Secreto: Asigna automáticamente los Amigos Secretos, asegurando que nadie se asigne a sí mismo, e impide que los usuarios vean quién es el Amigo Secreto de su destinatario. Asigna amigos secretos mediante consulta con información de la base de datos en MariaDB
- Visualización de Lista de Deseos: Muestra las listas de deseos de los usuarios para que todos los participantes las vean. No revele las asignaciones de Amigo Secreto.
- Herramienta de IA para Sugerencias de Regalos: Aprovecha la IA como herramienta para sugerir ideas de regalos basadas en los elementos de la lista de deseos de un usuario y sus intereses generales.
- Chat Grupal (opcional): Habilita una función de chat grupal para que los participantes se comuniquen sobre las preferencias de regalos.
- Chat Personal: Habilita una función de chat personal entre dos participantes para que se comuniquen sobre las preferencias de regalos.

## Style Guidelines:

- Color primario: Rojo festivo (#E63946) para evocar emoción y regalos.
- Color de fondo: Crema claro (#F1FAEE) para una sensación cálida y acogedora.
- Color de acento: Verde azulado (#457B9D) para elementos interactivos y destacados.
- Fuente del cuerpo y del título: 'PT Sans', una sans-serif moderna y cálida adecuada para todo el texto.
- Utiliza iconos simples y limpios para la navegación y las acciones comunes (por ejemplo, lista de deseos, perfil, configuración). Los iconos deben estar relacionados con los regalos y la temporada navideña, si corresponde.
- Mantén un diseño limpio e intuitivo que sea fácil de navegar tanto en dispositivos de escritorio como móviles.
- Utiliza animaciones sutiles para las interacciones del usuario, como agregar un regalo a la lista de deseos o confirmar una asignación de Amigo Secreto.