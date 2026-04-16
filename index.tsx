@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600&family=Outfit:wght@300;400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-void text-slate-300 font-sans antialiased transition-colors duration-1000;
  }
}

@theme {
  --font-sans: "Outfit", "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  --font-display: "Orbitron", sans-serif;
}

@layer components {
  .glass {
    @apply bg-surface backdrop-blur-xl border border-white/10 shadow-2xl;
  }
  
  .glass-dark {
    @apply bg-black/40 backdrop-blur-2xl border border-white/5 shadow-2xl;
  }
}
