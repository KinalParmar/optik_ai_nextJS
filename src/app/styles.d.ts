declare module '*.css' {
  const styles: { [className: string]: string }
  export default styles
}

// Tailwind CSS types
declare module 'tailwindcss/tailwind.css'
