# Puzzroo Game - Theme & UI Issues Explanation

Niche un issues ki details aur unke aane ki reasons Roman Urdu mai di gayi hain:

---

### **1. Page Switch karne par Black/White Screen ka Flash hona**
* **Kyun ho raha hai?** 
  Aapka theme (Dark/Light mode) check aur apply karne wala logic (`main.js` mai) `DOMContentLoaded` event ke baad chalta hai (yaani jab pura page load ho chuka hota hai). Jab browser page parse karna shuru karta hai, toh wo sabse pehle defaults style load karta hai. Agar browser default theme aur saved theme alag honge, toh browser pehle default theme render karega aur load hone ke baad Javascript chalne par saved theme par transition karega, jis se white/black flash visible hota hai.
* **Fix kaise hoga?**
  Hum har HTML page ke `<head>` tag ya `<body>` ke shuru mai ek chota sa inline JavaScript check add karenge jo page load/render hone se pehle `localStorage` se saved theme check kar ke use root element `<html>` par apply kar dega. Is se load hone se pehle hi correct theme render hogi aur koi screen flash nahi hoga.

---

### **2. Number Ninja Game ka Dark/Light Mode nahi chalna**
* **Kyun ho raha hai?**
  `main.css` mai Number Ninja (jo Nonogram variable properties use karta hai) ke dark mode variables ka CSS selector is tarah likha hai:
  ```css
  [data-theme="dark"] :root,
  body.dark-mode { ... }
  ```
  `[data-theme="dark"] :root` selector invalid hai kyunki CSS mai space ka matlab descendant hota hai, jabki `:root` (html element) kisi element ka child nahi ho sakta. Dusra, system level dark mode preferences (`@media (prefers-color-scheme: dark)`) mai Number Ninja / Nonogram ke core game variables define nahi hain.
* **Fix kaise hoga?**
  Hum is CSS selector ko change kar ke `:root[data-theme="dark"]` ya `[data-theme="dark"]` kar denge jo correctly match karega aur system media query preferences ke andar bhi in variables ko correct values ke sath assign kar denge.

---

### **3. Mobile par Option select karne ke baad Blue (Sticky Hover) reh jana**
* **Kyun ho raha hai?**
  Mobile screens par cursor nahi hota, is liye touch devices par jab hum click ya tap karte hain, toh browser us element par `:hover` styles ko apply kar deta hai aur tab tak highlighted rakhta hai jab tak user screen par kahi aur tap na kare. `main.css` mai `.mobile-link:hover` par background-color active/hover color set hai, jiski wajah se click karne ke baad wo menu item blue highlighted hi rehta hai.
* **Fix kaise hoga?**
  Hum hover styles ko `@media (hover: hover)` media query ke andar wrap karenge taake hover styling sirf un devices (desktops/laptops) par chale jinpar mouse aur cursor support ho, aur touch devices par click/tap karne se stuck hover effects na hon. Sath hi tap-highlight-color ko transparent kar denge.

---

### **4. Dark/Light button toggle karne par Login/Signup buttons ka hilna**
* **Kyun ho raha hai?**
  Theme switch karne par button ka text `"Light Mode"` (10 letters) se `"Dark Mode"` (9 letters) ho jata hai. `.theme-toggle-text` ka static width set na hone ki wajah se button ka size bar bar chota/bara hota hai. Navbar flex-box container hone ki wajah se jab right-side button ka size change hota hai, toh space adjust karne ke liye left par maujood Login aur Signup buttons thode se right ya left ko shift ho jate hain.
* **Fix kaise hoga?**
  Hum `.theme-toggle-text` ko CSS mai `display: inline-block; width: 90px; text-align: right;` ka rules assign kar denge taake iska width hamesha constant rahe aur button toggle karne par background items shift na hon.
