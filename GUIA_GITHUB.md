# Guía para Publicar en GitHub

Instrucciones paso a paso para publicar el proyecto en GitHub.

## 📋 Prerrequisitos

1. **Cuenta de GitHub**: Crear una en [github.com](https://github.com) si no tienes una
2. **Git instalado**: Verificar con `git --version`
3. **Proyecto listo**: Asegúrate de que el código esté completo

## 🚀 Pasos para Publicar

### Paso 1: Verificar Estado de Git

Primero, verifica si ya tienes un repositorio Git inicializado:

```bash
git status
```

Si no está inicializado, verás un mensaje indicándolo.

### Paso 2: Inicializar Repositorio Git (si es necesario)

Si no tienes Git inicializado:

```bash
git init
```

### Paso 3: Verificar Archivos a Subir

Revisa qué archivos se van a subir:

```bash
git status
```

**Importante**: Asegúrate de que:
- ✅ `.env` y `.env.local` NO aparezcan (están en .gitignore)
- ✅ `node_modules/` NO aparezca
- ✅ `.next/` NO aparezca
- ✅ `prisma/dev.db` NO aparezca (base de datos local)
- ✅ Solo archivos de código fuente aparezcan

### Paso 4: Agregar Archivos al Staging

Agrega todos los archivos al área de staging:

```bash
git add .
```

O si prefieres agregar archivos específicos:

```bash
git add README.md
git add src/
git add prisma/schema.prisma
# etc.
```

### Paso 5: Crear Primer Commit

Crea el commit inicial:

```bash
git commit -m "Initial commit: Sistema de Gestión de Mantenciones CAR"
```

O un mensaje más descriptivo:

```bash
git commit -m "feat: Sistema completo de gestión de mantenciones

- Módulo de equipos e instalaciones
- Sistema de pautas de mantención
- Ejecución de mantenciones con checklist
- Firmas digitales
- Dashboard y analítica
- Sistema de permisos y auditoría
- Programación anual con calendario"
```

### Paso 6: Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Click en el botón **"+"** (arriba derecha) → **"New repository"**
3. Completa el formulario:
   - **Repository name**: `mantenciones-car` (o el nombre que prefieras)
   - **Description**: "Sistema de gestión de mantenciones preventivas y correctivas para red de salud municipal"
   - **Visibility**: 
     - ✅ **Public** (cualquiera puede ver)
     - 🔒 **Private** (solo tú y colaboradores)
   - ⚠️ **NO marques** "Initialize this repository with a README" (ya tienes uno)
   - ⚠️ **NO agregues** .gitignore ni license (ya los tienes)
4. Click en **"Create repository"**

### Paso 7: Conectar Repositorio Local con GitHub

GitHub te mostrará comandos. Usa estos (reemplaza `TU_USUARIO` con tu usuario de GitHub):

**Si es la primera vez (sin commits previos):**

```bash
git remote add origin https://github.com/TU_USUARIO/mantenciones-car.git
git branch -M main
git push -u origin main
```

**Si ya tienes commits:**

```bash
git remote add origin https://github.com/TU_USUARIO/mantenciones-car.git
git branch -M main
git push -u origin main
```

### Paso 8: Verificar Publicación

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/mantenciones-car`
2. Verifica que todos los archivos estén presentes
3. Verifica que el README.md se muestre correctamente

## 🔐 Configuración de Seguridad

### Variables de Entorno

**IMPORTANTE**: Nunca subas archivos `.env` con información sensible.

1. Crea manualmente un archivo `.env.example` en la raíz del proyecto con:

```env
# Base de datos
DATABASE_URL="file:./prisma/dev.db"

# Autenticación
NEXTAUTH_SECRET="cambiar-por-secret-seguro"
NEXTAUTH_URL="http://localhost:3000"
```

2. Agrega `.env.example` al repositorio (está en .gitignore pero puedes forzarlo):

```bash
git add -f .env.example
git commit -m "docs: Agregar archivo .env.example"
git push
```

**Nota**: El archivo `.env.example` debe estar en el repositorio para que otros desarrolladores sepan qué variables necesitan configurar.

### Secrets en GitHub (para CI/CD)

Si usas GitHub Actions o despliegues automáticos:

1. Ve a tu repositorio → **Settings** → **Secrets and variables** → **Actions**
2. Agrega secrets:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - Cualquier otra variable sensible

## 📝 Mejoras Adicionales

### Agregar Licencia

Si quieres agregar una licencia:

```bash
# Crear archivo LICENSE
# Luego:
git add LICENSE
git commit -m "docs: Agregar licencia"
git push
```

### Agregar Badges al README

Puedes agregar badges al inicio del README.md:

```markdown
![GitHub](https://img.shields.io/github/license/TU_USUARIO/mantenciones-car)
![GitHub last commit](https://img.shields.io/github/last-commit/TU_USUARIO/mantenciones-car)
![GitHub repo size](https://img.shields.io/github/repo-size/TU_USUARIO/mantenciones-car)
```

### Configurar GitHub Pages (opcional)

Si quieres documentación pública:

1. Ve a **Settings** → **Pages**
2. Selecciona branch `main` y carpeta `/docs` o `/`
3. Guarda

## 🔄 Comandos Útiles para el Futuro

### Subir Cambios

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

### Ver Estado

```bash
git status
```

### Ver Historial

```bash
git log --oneline
```

### Crear Nueva Rama

```bash
git checkout -b nombre-rama
# Hacer cambios
git add .
git commit -m "Descripción"
git push -u origin nombre-rama
```

## ⚠️ Checklist Antes de Publicar

- [ ] Verificar que `.env` esté en `.gitignore`
- [ ] Verificar que `node_modules/` esté en `.gitignore`
- [ ] Verificar que `.next/` esté en `.gitignore`
- [ ] Verificar que `prisma/dev.db` esté en `.gitignore`
- [ ] Revisar que no haya información sensible en el código
- [ ] Revisar que el README.md esté completo
- [ ] Verificar que todos los archivos importantes estén presentes
- [ ] Probar que el proyecto compile: `npm run build`

## 🆘 Solución de Problemas

### Error: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/mantenciones-car.git
```

### Error: "failed to push some refs"

```bash
git pull origin main --rebase
git push
```

### Error: "authentication failed"

1. Usa un Personal Access Token en lugar de contraseña
2. O configura SSH keys en GitHub

### Eliminar Archivo del Repositorio (pero mantenerlo local)

```bash
git rm --cached archivo.txt
git commit -m "Eliminar archivo del repositorio"
git push
```

## 📚 Recursos Adicionales

- [Documentación de Git](https://git-scm.com/doc)
- [Guía de GitHub](https://guides.github.com/)
- [GitHub CLI](https://cli.github.com/) (alternativa a la web)

---

**¡Listo!** Tu proyecto ahora está en GitHub. 🎉

