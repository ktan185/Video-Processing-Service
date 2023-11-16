const greetings = [
    "Hello",         // English
    "Hola",          // Spanish
    "Bonjour",       // French
    "Hallo",         // German
    "Ciao",          // Italian
    "こんにちは",    // Japanese (Konnichiwa)
    "안녕하세요",      // Korean (Annyeonghaseyo)
    "你好",          // Chinese (Nǐ hǎo)
    "Привет",        // Russian (Privet)
    "مرحبا",        // Arabic (Marhaba)
    "Xin chào",     // Vietnamese
    "Welcome back", // English
    "Bienvenido de nuevo", // Spanish
    "Bienvenue à nouveau", // French
    "Willkommen zurück",   // German
    "Bentornato",         // Italian
    "おかえり",           // Japanese (Okaeri)
    "다시 오신 것을 환영합니다", // Korean (Dasi osin geoseul hwanyeonghamnida)
    "欢迎回来",            // Chinese (Huānyíng huílái)
  ];

export default function getRandomGreeting() {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
}

