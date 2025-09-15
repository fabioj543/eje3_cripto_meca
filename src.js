// JS modularizado desde index.html

// Crear partículas flotantes
function createFloatingParticles() {
  const container = document.querySelector('.floating-particles');
  const particleCount = 15;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 8 + 4;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
    particle.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(particle);
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  return btoa(String.fromCharCode(...bytes));
}

function showErrorToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}

async function encryptUsername(username) {
  try {
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const encoder = new TextEncoder();
    const plaintext = encoder.encode(username);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      plaintext
    );
    return {
      data: arrayBufferToBase64(encrypted),
      iv: arrayBufferToBase64(iv),
      algorithm: 'AES-GCM-256'
    };
  } catch (error) {
    throw new Error('Error en cifrado simétrico: ' + error.message);
  }
}

async function encryptPassword(password) {
  try {
    const rsaKeyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-256" }
      },
      true,
      ["encrypt", "decrypt"]
    );
    const encoder = new TextEncoder();
    const plaintext = encoder.encode(password);
    const encrypted = await crypto.subtle.encrypt(
      { name: "RSA-OAEP", hash: { name: "SHA-256" } },
      rsaKeyPair.publicKey,
      plaintext
    );
    return {
      data: arrayBufferToBase64(encrypted),
      algorithm: 'RSA-OAEP-2048'
    };
  } catch (error) {
    throw new Error('Error en cifrado asimétrico: ' + error.message);
  }
}

function typewriterEffect(element, text, speed = 30) {
  element.textContent = '';
  let index = 0;
  const timer = setInterval(() => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(timer);
    }
  }, speed);
}

async function submitForm(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const submitButton = document.querySelector('.submit-button');
  const buttonText = submitButton.querySelector('.button-text');
  const resultDiv = document.getElementById("result");
  const mainContainer = document.querySelector('.main-container');
  
  if (!username || !password) {
    showErrorToast('Por favor complete todos los campos');
    return;
  }
  if (password.length < 6) {
    showErrorToast('La contraseña debe tener al menos 6 caracteres');
    return;
  }
  
  submitButton.classList.add('loading');
  buttonText.style.opacity = '0';
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const userEncrypted = await encryptUsername(username);
    const passEncrypted = await encryptPassword(password);
    
    // Mover formulario a la izquierda y mostrar resultados
    mainContainer.classList.add('has-results');
    
    document.getElementById("encryptedUser").textContent = '';
    document.getElementById("encryptedPass").textContent = '';
    
    // Pequeño delay para que la animación del contenedor se ejecute primero
    setTimeout(() => {
      resultDiv.classList.add('show');
    }, 200);
    
    setTimeout(() => {
      typewriterEffect(
        document.getElementById("encryptedUser"), 
        userEncrypted.data,
        20
      );
    }, 500);
    
    setTimeout(() => {
      typewriterEffect(
        document.getElementById("encryptedPass"), 
        passEncrypted.data,
        20
      );
    }, 1000);
    
    console.log('🔐 Cifrado completado:', {
      usuario: userEncrypted,
      contraseña: passEncrypted,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error de cifrado:", error);
    showErrorToast(error.message || "Error al procesar el cifrado");
    // Ocultar resultados y volver al centro
    resultDiv.classList.remove('show');
    mainContainer.classList.remove('has-results');
  } finally {
    setTimeout(() => {
      submitButton.classList.remove('loading');
      buttonText.style.opacity = '1';
    }, 500);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  createFloatingParticles();
  document.getElementById("loginForm").addEventListener("submit", submitForm);
  
  const inputs = document.querySelectorAll('input');
  const mainContainer = document.querySelector('.main-container');
  const resultDiv = document.getElementById("result");
  
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.style.transform = 'scale(1)';
    });
    
    // Si el usuario empieza a escribir de nuevo, ocultar resultados y centrar formulario
    input.addEventListener('input', function() {
      if (resultDiv.classList.contains('show')) {
        resultDiv.classList.remove('show');
        mainContainer.classList.remove('has-results');
      }
    });
  });
  
  setTimeout(() => {
    document.querySelector('.form-container').style.transform = 'scale(1)';
  }, 100);
});
document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.key === 'Enter') {
    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
  }
});
