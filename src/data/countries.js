// src/data/countries.js
// ✅ Brazil-focused list — Arabic countries removed, Latin America + global partners added
export const country = [
  // ─── PRIMARY (Brazil) ─────────────────────────────────────
  { name: "Brazil", code: "BR", flag: "🇧🇷", phoneExtension: "+55", currency: "BRL", symbol: "R$" },

  // ─── LATIN AMERICA ────────────────────────────────────────
  { name: "Argentina", code: "AR", flag: "🇦🇷", phoneExtension: "+54", currency: "ARS", symbol: "$" },
  { name: "Bolivia", code: "BO", flag: "🇧🇴", phoneExtension: "+591", currency: "BOB", symbol: "Bs" },
  { name: "Chile", code: "CL", flag: "🇨🇱", phoneExtension: "+56", currency: "CLP", symbol: "$" },
  { name: "Colombia", code: "CO", flag: "🇨🇴", phoneExtension: "+57", currency: "COP", symbol: "$" },
  { name: "Costa Rica", code: "CR", flag: "🇨🇷", phoneExtension: "+506", currency: "CRC", symbol: "₡" },
  { name: "Cuba", code: "CU", flag: "🇨🇺", phoneExtension: "+53", currency: "CUP", symbol: "$" },
  { name: "Dominican Republic", code: "DO", flag: "🇩🇴", phoneExtension: "+1", currency: "DOP", symbol: "RD$" },
  { name: "Ecuador", code: "EC", flag: "🇪🇨", phoneExtension: "+593", currency: "USD", symbol: "$" },
  { name: "El Salvador", code: "SV", flag: "🇸🇻", phoneExtension: "+503", currency: "USD", symbol: "$" },
  { name: "Guatemala", code: "GT", flag: "🇬🇹", phoneExtension: "+502", currency: "GTQ", symbol: "Q" },
  { name: "Honduras", code: "HN", flag: "🇭🇳", phoneExtension: "+504", currency: "HNL", symbol: "L" },
  { name: "Mexico", code: "MX", flag: "🇲🇽", phoneExtension: "+52", currency: "MXN", symbol: "$" },
  { name: "Nicaragua", code: "NI", flag: "🇳🇮", phoneExtension: "+505", currency: "NIO", symbol: "C$" },
  { name: "Panama", code: "PA", flag: "🇵🇦", phoneExtension: "+507", currency: "PAB", symbol: "B/." },
  { name: "Paraguay", code: "PY", flag: "🇵🇾", phoneExtension: "+595", currency: "PYG", symbol: "₲" },
  { name: "Peru", code: "PE", flag: "🇵🇪", phoneExtension: "+51", currency: "PEN", symbol: "S/" },
  { name: "Puerto Rico", code: "PR", flag: "🇵🇷", phoneExtension: "+1", currency: "USD", symbol: "$" },
  { name: "Uruguay", code: "UY", flag: "🇺🇾", phoneExtension: "+598", currency: "UYU", symbol: "$U" },
  { name: "Venezuela", code: "VE", flag: "🇻🇪", phoneExtension: "+58", currency: "VES", symbol: "Bs" },

  // ─── NORTH AMERICA ────────────────────────────────────────
  { name: "United States", code: "US", flag: "🇺🇸", phoneExtension: "+1", currency: "USD", symbol: "$" },
  { name: "Canada", code: "CA", flag: "🇨🇦", phoneExtension: "+1", currency: "CAD", symbol: "C$" },

  // ─── EUROPE ───────────────────────────────────────────────
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", phoneExtension: "+44", currency: "GBP", symbol: "£" },
  { name: "Germany", code: "DE", flag: "🇩🇪", phoneExtension: "+49", currency: "EUR", symbol: "€" },
  { name: "France", code: "FR", flag: "🇫🇷", phoneExtension: "+33", currency: "EUR", symbol: "€" },
  { name: "Italy", code: "IT", flag: "🇮🇹", phoneExtension: "+39", currency: "EUR", symbol: "€" },
  { name: "Spain", code: "ES", flag: "🇪🇸", phoneExtension: "+34", currency: "EUR", symbol: "€" },
  { name: "Portugal", code: "PT", flag: "🇵🇹", phoneExtension: "+351", currency: "EUR", symbol: "€" },
  { name: "Netherlands", code: "NL", flag: "🇳🇱", phoneExtension: "+31", currency: "EUR", symbol: "€" },
  { name: "Belgium", code: "BE", flag: "🇧🇪", phoneExtension: "+32", currency: "EUR", symbol: "€" },
  { name: "Switzerland", code: "CH", flag: "🇨🇭", phoneExtension: "+41", currency: "CHF", symbol: "Fr" },
  { name: "Sweden", code: "SE", flag: "🇸🇪", phoneExtension: "+46", currency: "SEK", symbol: "kr" },
  { name: "Norway", code: "NO", flag: "🇳🇴", phoneExtension: "+47", currency: "NOK", symbol: "kr" },
  { name: "Denmark", code: "DK", flag: "🇩🇰", phoneExtension: "+45", currency: "DKK", symbol: "kr" },
  { name: "Finland", code: "FI", flag: "🇫🇮", phoneExtension: "+358", currency: "EUR", symbol: "€" },
  { name: "Ireland", code: "IE", flag: "🇮🇪", phoneExtension: "+353", currency: "EUR", symbol: "€" },
  { name: "Poland", code: "PL", flag: "🇵🇱", phoneExtension: "+48", currency: "PLN", symbol: "zł" },
  { name: "Ukraine", code: "UA", flag: "🇺🇦", phoneExtension: "+380", currency: "UAH", symbol: "₴" },
  { name: "Russia", code: "RU", flag: "🇷🇺", phoneExtension: "+7", currency: "RUB", symbol: "₽" },
  { name: "Turkey", code: "TR", flag: "🇹🇷", phoneExtension: "+90", currency: "TRY", symbol: "₺" },

  // ─── ASIA ─────────────────────────────────────────────────
  { name: "Japan", code: "JP", flag: "🇯🇵", phoneExtension: "+81", currency: "JPY", symbol: "¥" },
  { name: "China", code: "CN", flag: "🇨🇳", phoneExtension: "+86", currency: "CNY", symbol: "¥" },
  { name: "India", code: "IN", flag: "🇮🇳", phoneExtension: "+91", currency: "INR", symbol: "₹" },
  { name: "Singapore", code: "SG", flag: "🇸🇬", phoneExtension: "+65", currency: "SGD", symbol: "S$" },
  { name: "Malaysia", code: "MY", flag: "🇲🇾", phoneExtension: "+60", currency: "MYR", symbol: "RM" },
  { name: "Thailand", code: "TH", flag: "🇹🇭", phoneExtension: "+66", currency: "THB", symbol: "฿" },
  { name: "Vietnam", code: "VN", flag: "🇻🇳", phoneExtension: "+84", currency: "VND", symbol: "₫" },
  { name: "Indonesia", code: "ID", flag: "🇮🇩", phoneExtension: "+62", currency: "IDR", symbol: "Rp" },
  { name: "Philippines", code: "PH", flag: "🇵🇭", phoneExtension: "+63", currency: "PHP", symbol: "₱" },
  { name: "Pakistan", code: "PK", flag: "🇵🇰", phoneExtension: "+92", currency: "PKR", symbol: "₨" },
  { name: "South Korea", code: "KR", flag: "🇰🇷", phoneExtension: "+82", currency: "KRW", symbol: "₩" },

  // ─── AFRICA ───────────────────────────────────────────────
  { name: "Nigeria", code: "NG", flag: "🇳🇬", phoneExtension: "+234", currency: "NGN", symbol: "₦" },
  { name: "South Africa", code: "ZA", flag: "🇿🇦", phoneExtension: "+27", currency: "ZAR", symbol: "R" },
  { name: "Kenya", code: "KE", flag: "🇰🇪", phoneExtension: "+254", currency: "KES", symbol: "KSh" },
  { name: "Ghana", code: "GH", flag: "🇬🇭", phoneExtension: "+233", currency: "GHS", symbol: "₵" },
  { name: "Angola", code: "AO", flag: "🇦🇴", phoneExtension: "+244", currency: "AOA", symbol: "Kz" },
  { name: "Mozambique", code: "MZ", flag: "🇲🇿", phoneExtension: "+258", currency: "MZN", symbol: "MT" },
  { name: "Cape Verde", code: "CV", flag: "🇨🇻", phoneExtension: "+238", currency: "CVE", symbol: "$" },

  // ─── OCEANIA ──────────────────────────────────────────────
  { name: "Australia", code: "AU", flag: "🇦🇺", phoneExtension: "+61", currency: "AUD", symbol: "A$" },
  { name: "New Zealand", code: "NZ", flag: "🇳🇿", phoneExtension: "+64", currency: "NZD", symbol: "NZ$" },
];