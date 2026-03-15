const ITEMS = [
  {
    title: "Encrypted at rest",
    desc: "AES-256 encryption",
    icon: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
  },
  {
    title: "Never trained on",
    desc: "Your data stays out of AI",
    icon: "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "GDPR compliant",
    desc: "Full export & deletion",
    icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  },
  {
    title: "TLS 1.3 in transit",
    desc: "Always encrypted",
    icon: "M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33",
  },
];

export default function LandingTrust() {
  return (
    <section className="py-10 px-6 bg-navy" aria-label="Trust and security — your data stays yours">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0">
          {ITEMS.map((item, i) => (
            <div
              key={item.title}
              className={`flex-1 flex items-start gap-3 px-3 sm:px-6 py-2 ${
                i < ITEMS.length - 1 ? "md:border-r md:border-white/10" : ""
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0 mt-0.5 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <div>
                <h3 className="text-white text-sm font-medium leading-tight">{item.title}</h3>
                <p className="text-blue-100/70 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
