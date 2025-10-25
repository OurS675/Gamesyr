import React from 'react';
import './Tutorials.css';
import { FaDownload, FaWindows, FaApple, FaLinux, FaArchive, FaExclamationTriangle } from 'react-icons/fa';

function Tutorials() {
  return (
    <div className="tutorials-container">
      <h1>Tutoriales de Instalación</h1>
      <p className="tutorials-intro">
        Aprende a instalar tus juegos favoritos con estos sencillos tutoriales paso a paso.
      </p>

      <div className="tutorial-section">
        <h2><FaWindows /> Instalación en Windows</h2>
        <div className="tutorial-card">
          <h3>Archivos ISO</h3>
          <ol>
            <li>Descarga el archivo ISO del juego</li>
            <li>Monta el archivo ISO haciendo doble clic o usando software como WinCDEmu o Daemon Tools</li>
            <li>Ejecuta el instalador (setup.exe) y sigue las instrucciones</li>
            <li>Si se requiere, copia el crack de la carpeta "Crack" a la carpeta de instalación</li>
            <li>¡Disfruta del juego!</li>
          </ol>
        </div>

        <div className="tutorial-card">
          <h3>Archivos Comprimidos (RAR/ZIP)</h3>
          <ol>
            <li>Descarga el archivo comprimido</li>
            <li>Extrae usando WinRAR o 7-Zip</li>
            <li>Ejecuta el instalador (setup.exe) o copia la carpeta extraída a tu ubicación preferida</li>
            <li>Ejecuta el juego desde el archivo .exe principal</li>
          </ol>
        </div>
      </div>

      <div className="tutorial-section">
        <h2><FaApple /> Instalación en Mac</h2>
        <div className="tutorial-card">
          <ol>
            <li>Descarga el archivo DMG o PKG</li>
            <li>Monta el archivo DMG haciendo doble clic</li>
            <li>Arrastra la aplicación a tu carpeta de Aplicaciones</li>
            <li>Para archivos PKG, haz doble clic y sigue el asistente de instalación</li>
            <li>Si es necesario, aplica el parche o crack según las instrucciones incluidas</li>
          </ol>
        </div>
      </div>

      <div className="tutorial-section">
        <h2><FaLinux /> Instalación en Linux</h2>
        <div className="tutorial-card">
          <ol>
            <li>Descarga el archivo comprimido (generalmente .tar.gz)</li>
            <li>Abre una terminal y navega hasta la ubicación del archivo</li>
            <li>Extrae usando: <code>tar -xzf nombre_archivo.tar.gz</code></li>
            <li>Navega a la carpeta extraída: <code>cd nombre_carpeta</code></li>
            <li>Ejecuta el instalador o el script de instalación: <code>./setup.sh</code> o <code>./nombre_juego</code></li>
            <li>Sigue las instrucciones en pantalla</li>
          </ol>
        </div>
      </div>

      <div className="tutorial-section warning-section">
        <h2><FaExclamationTriangle /> Solución de Problemas Comunes</h2>
        <div className="tutorial-card">
          <h3>El juego no inicia</h3>
          <ul>
            <li>Verifica que tu sistema cumple con los requisitos mínimos</li>
            <li>Asegúrate de haber copiado correctamente el crack (si es necesario)</li>
            <li>Ejecuta el juego como administrador</li>
            <li>Desactiva temporalmente el antivirus (los cracks suelen ser detectados como falsos positivos)</li>
            <li>Instala las dependencias necesarias (.NET Framework, DirectX, Visual C++ Redistributables)</li>
          </ul>
        </div>

        <div className="tutorial-card">
          <h3>Errores durante la instalación</h3>
          <ul>
            <li>Asegúrate de tener suficiente espacio en disco</li>
            <li>Verifica que la descarga esté completa y no corrupta</li>
            <li>Intenta ejecutar el instalador como administrador</li>
            <li>Desactiva temporalmente el antivirus durante la instalación</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Tutorials;