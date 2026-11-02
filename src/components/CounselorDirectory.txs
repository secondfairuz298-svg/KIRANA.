import React, { useEffect, useState } from 'react';

interface Portfolio {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
}

interface Counselor {
  id: string;
  fullName: string;
  title: string;
  avatarUrl: string;
  counselorBio: string;
  counselingStyle: string;
  hourlyRate: string;
  portfolios: Portfolio[];
}

export const CounselorDirectory: React.FC = () => {
  const [counselors, setCounselors] = useState<Counselor[]>([]);

  useEffect(() => {
    fetch('/api/counselors')
      .then((res) => res.json())
      .then((data) => setCounselors(data));
  }, []);

  return (
    <div className="p-8 bg-kirana-cream-50 min-h-screen text-kirana-brown-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-kirana-brown-800 mb-2">Direktori Konselor Profesional</h1>
        <p className="text-kirana-brown-700 mb-8">Pilih konselor yang sesuai dengan preferensi, pendekatan, dan kebutuhan Anda.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counselors.map((c) => (
            <div
              key={c.id}
              className="bg-kirana-cream-100 border border-kirana-cream-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={c.avatarUrl}
                    alt={c.fullName}
                    className="w-16 h-16 rounded-full border-2 border-kirana-brown-500 object-cover"
                  />
                  <div>
                    <h2 className="font-bold text-lg text-kirana-brown-900">{c.fullName}</h2>
                    <span className="text-xs bg-kirana-cream-200 text-kirana-brown-700 font-semibold px-2 py-0.5 rounded-full">
                      {c.title || 'Konselor Berlisensi'}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xs font-bold text-kirana-brown-700 uppercase tracking-wider mb-1">Pendekatan Konseling</h3>
                  <p className="text-sm text-kirana-brown-900 bg-kirana-cream-50 p-2.5 rounded-xl border border-kirana-cream-200">
                    {c.counselingStyle || 'Pendekatan Humanistik & CBT'}
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="text-xs font-bold text-kirana-brown-700 uppercase tracking-wider mb-1">Portofolio & Publikasi</h3>
                  {c.portfolios && c.portfolios.length > 0 ? (
                    <ul className="text-xs space-y-1 text-kirana-brown-800">
                      {c.portfolios.map((item) => (
                        <li key={item.id} className="truncate">
                          • <a href={item.fileUrl} target="_blank" rel="noreferrer" className="underline hover:text-kirana-brown-500">{item.title}</a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-kirana-brown-500 italic">Belum ada portofolio terlampir.</p>
                  )}
                </div>
              </div>

              {/* Red Card: Tarif Jasa Konseling */}
              <div className="mt-4 pt-4 border-t border-kirana-cream-300 flex items-center justify-between">
                <div>
                  <span className="text-xs text-kirana-brown-700 block">Tarif Layanan (Red Card)</span>
                  <span className="text-lg font-black text-kirana-brown-800">
                    {c.hourlyRate ? `Rp ${Number(c.hourlyRate).toLocaleString('id-ID')} / sesi` : 'Konsultasi Terbuka'}
                  </span>
                </div>
                <button className="bg-kirana-brown-700 hover:bg-kirana-brown-800 text-kirana-cream-50 px-4 py-2 rounded-xl text-sm font-semibold transition">
                  Pilih Konselor
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
