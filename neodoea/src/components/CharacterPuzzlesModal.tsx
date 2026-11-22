import React, { useState } from 'react';
import {
  CheckCircle2,
  Eye,
  HeartHandshake,
  Terminal,
  X,
  AlertCircle,
  ShieldAlert,
  KeyRound,
  Users,
  LockOpen,
} from 'lucide-react';
import { ASSETS, CHARACTER_PROFILES } from '../data/gameData';
import type { GameOverReason, PlayableCharacterId } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

export type CharacterPuzzleMode =
  | 'curiosity_plaza'
  | 'curiosity_panel'
  | 'empathy_raka'
  | 'empathy_wiryo'
  | 'hacking_gate'
  | 'hacking_kiosk'
  | 'hacking_log';

interface CharacterPuzzleProps {
  mode: CharacterPuzzleMode;
  activeCharacter: PlayableCharacterId;
  onSelectCharacter: (char: PlayableCharacterId) => void;
  onWrongCharacter: (reason: GameOverReason) => void;
  onSuccess: () => void;
  onClose: () => void;
}

// === 1. NINO: CURIOSITY TRIGGER (SPOT 3 HIDDEN ANOMALIES) ===
const RELAY_NODES = [
  {
    id: 'sponsor',
    title: 'Modul Prioritas Sponsor Global',
    desc: 'Mengalihkan 85% slot layar publik ke klip viral luar negeri tanpa rotasi.',
    isAnomaly: true,
  },
  {
    id: 'lamp',
    title: 'Sakelar Lampu Jalan Plaza',
    desc: 'Sensor otomatis menyalakan lampu taman saat langit mulai gelap.',
    isAnomaly: false,
  },
  {
    id: 'filter',
    title: 'Penghambat Tag Acara Lokal',
    desc: 'Menyembunyikan jadwal panggung seni warga dari halaman beranda.',
    isAnomaly: true,
  },
  {
    id: 'autoplay',
    title: 'Loop Autoplay Tanpa Jeda',
    desc: 'Memutar video serupa terus-menerus agar warga tetap menatap layar.',
    isAnomaly: true,
  },
];

// === 2. DIRA: SOCIAL EMPATHY WITH RAKA (QUEST 2) ===
const RAKA_EMPATHY_STEPS = [
  {
    npcMood: 'Raka menunduk kaku sambil memeluk tablet hologramnya.',
    npcLine: '"Ngapain sih kalian nanya-nanya? Semua orang juga lihat tren yang sama kok!"',
    options: [
      {
        text: '"Kamu tuh kecanduan layar! Matiin aja sekarang!"',
        isEmpathetic: false,
        feedback: 'Nada menuduh membuat Raka makin defensif dan menutup diri.',
      },
      {
        text: '"Kami nggak nyalahin kamu suka musik luar, Rak. Lagunya emang seru. Cuma penasaran, kamu masih sering ketemu teman sekolah?"',
        isEmpathetic: true,
        feedback: 'Raka melunak karena merasa tidak dihakimi.',
      },
    ],
  },
  {
    npcMood: 'Raka menurunkan layar tabletnya sedikit, tatapannya agak ragu.',
    npcLine: '"Sebenarnya... kalau nggak ngikutin update artis luar tiap hari, aku takut nggak nyambung pas istirahat."',
    options: [
      {
        text: '"Jadi kamu ikut terus supaya tetap diterima teman-teman ya? Rasanya capek juga nggak sih ngejar tren tiap jam?"',
        isEmpathetic: true,
        feedback: 'Raka mengangguk pelan—ia merasa akhirnya ada yang memahami tekanannya.',
      },
      {
        text: '"Ah, lebay banget. Tinggal nggak usah peduli aja sama omongan orang."',
        isEmpathetic: false,
        feedback: 'Mengabaikan kekhawatiran sosial Raka memutus rasa percaya.',
      },
    ],
  },
];

// === 3. DIRA: SOCIAL EMPATHY WITH PAK WIRYO (QUEST 3) ===
const WIRYO_EMPATHY_STEPS = [
  {
    npcMood: 'Pak Wiryo menghela napas berat sambil merapikan kain penutup gong.',
    npcLine:
      '"Anak-anak muda sekarang cuma mengejar tren layar luar negeri. Buat apa pendopo tua ini dibuka lagi kalau ujung-ujungnya hanya ditertawakan?"',
    options: [
      {
        text: '"Justru itu tugas Pak Wiryo buat memaksa anak muda menonton wayang dan gamelan tanpa musik modern!"',
        isEmpathetic: false,
        feedback: 'Memaksakan pendekatan sepihak membuat Pak Wiryo makin pesimis dan enggan bekerja sama.',
      },
      {
        text: '"Kekecewaan Bapak sangat wajar... Tapi sebenarnya banyak pelajar tidak tahu jadwal pendopo karena tertutup feed digital, bukan karena membenci tradisi."',
        isEmpathetic: true,
        feedback: 'Pak Wiryo terdiam dan menatap Dira—ia merasa kesedihannya akhirnya dimengerti.',
      },
    ],
  },
  {
    npcMood: 'Tatapan Pak Wiryo mulai hangat, meski masih ragu menyalakan lampu panggung.',
    npcLine:
      '"Andai pendopo dibuka lagi, bagaimana caranya budaya tradisional bisa bersanding dengan selera remaja kota sekarang tanpa kehilangan jati dirinya?"',
    options: [
      {
        text: '"Kita tidak perlu menolak budaya luar, Pak—kita bisa kolaborasikan gamelan dengan aransemen modern dan siarkan jadwalnya secara adil di layar kota."',
        isEmpathetic: true,
        feedback: 'Pak Wiryo tersenyum lega dan mempercayakan kunci pendopo kepada tim!',
      },
      {
        text: '"Sudahlah, Pak, ikuti saja tren luar seratus persen supaya ramai lagi."',
        isEmpathetic: false,
        feedback: 'Menghilangkan jati diri tradisi membuat Pak Wiryo kembali menutup pendopo.',
      },
    ],
  },
];

// === 4. ILYAS: BINARY FIREWALL CHECKSUM (QUEST 4 GATE) ===
const HACK_ROWS = [
  { label: 'Node A (Otorisasi)', target: 7, values: [1, 2, 4, 8] },
  { label: 'Node B (Enkripsi)', target: 10, values: [1, 2, 4, 8] },
  { label: 'Node C (Jembatan Log)', target: 12, values: [1, 2, 4, 8] },
];

// === 5. ILYAS: LOG DECRYPTION CIPHER (QUEST 4 LOG CONSOLE) ===
const LOG_PACKETS = [
  {
    id: 'pkt1',
    code: 'PKT-01 [0x4A]',
    encryptedHex: '72 61 6B 61 5F 63 6C 69 6B 5F 31 35 73',
    hint: 'Paket merekam pemicu awal dari sesi tontonan 15 detik milik akun Raka_XI.',
    decodedText: 'TRIGGER: 1 klik klip musik pop global (15s) membuka profil preferensi.',
    correctKey: 'DECRYPT_USER_CLICK',
    keyOptions: ['DECRYPT_LAMP_GRID', 'DECRYPT_USER_CLICK', 'DECRYPT_AUDIO_GAIN'],
  },
  {
    id: 'pkt2',
    code: 'PKT-02 [0x7F]',
    encryptedHex: '62 6F 6F 73 74 5F 33 34 30 5F 67 6C 6F 62 61 6C',
    hint: 'Paket mengatur bobot pengali skor tren global sebesar +340%.',
    decodedText: 'WEIGHT_MULTIPLIER: Konten tren seragam dinaikkan +340% di feed publik.',
    correctKey: 'DECRYPT_TREND_BIAS',
    keyOptions: ['DECRYPT_TREND_BIAS', 'DECRYPT_TICKET_BOX', 'DECRYPT_PORTAL_KEY'],
  },
  {
    id: 'pkt3',
    code: 'PKT-03 [0x9C]',
    encryptedHex: '6D 75 74 65 5F 6C 6F 63 61 6C 5F 39 36 25',
    hint: 'Paket terakhir menekan unggahan seni lokal hingga tersisa ruang gema 96%.',
    decodedText: 'FILTER_BUBBLE: Tag acara pendopo diturunkan hingga 96% layar berisi tren seragam.',
    correctKey: 'DECRYPT_LOCAL_SUPPRESS',
    keyOptions: ['DECRYPT_RAIN_SENSOR', 'DECRYPT_LOCAL_SUPPRESS', 'DECRYPT_BUS_ROUTE'],
  },
];

interface DispatchConfig {
  requiredChar: PlayableCharacterId;
  requiredSkill: 'Curiosity Trigger' | 'Data Hacking' | 'Social Empathy';
  questLabel: string;
  scenarioTitle: string;
  scenarioDesc: string;
  buildGameOver: (chosen: PlayableCharacterId) => GameOverReason;
}

// === 1B. NINO: CURIOSITY PANEL (SOUND BOX ACCESS CARD IN STAGE) ===
const PANEL_CLUES = [
  {
    id: 'panel_tag',
    title: 'Label Teknisi Festival Lama',
    desc: 'Tertulis rute darurat menuju Terminal Server Kota di balik sekat logam.',
    isClue: true,
  },
  {
    id: 'panel_dust',
    title: 'Penutup Sekring Lampu Taman',
    desc: 'Sekring penerangan jalan biasa yang sudah tidak tersambung ke panggung.',
    isClue: false,
  },
  {
    id: 'panel_slot',
    title: 'Celah Kartu Magnetik Tersembunyi',
    desc: 'Ada ujung kartu akses berwarna biru yang terselip di bawah gulungan kabel audio.',
    isClue: true,
  },
];

const DISPATCH_RULES: Partial<Record<CharacterPuzzleMode, DispatchConfig>> = {
  curiosity_plaza: {
    requiredChar: 'nino',
    requiredSkill: 'Curiosity Trigger',
    questLabel: 'Wilayah 2 · Sandang Ayu Plaza',
    scenarioTitle: 'Pilih Anggota Tim untuk Memeriksa Panel Relay',
    scenarioDesc:
      'Kotak logam di bawah layar raksasa ini dipenuhi sekring dan kabel mencurigakan. Siapa anggota tim yang paling peka meneliti kejanggalan benda fisik?',
    buildGameOver: (chosen) => ({
      title: 'Panel Relay Terkunci Otomatis',
      cause:
        chosen === 'ilyas'
          ? 'Ilyas langsung menyambungkan pemindai digital tanpa memeriksa segel fisik terlebih dahulu sehingga sensor pengaman mengunci penutup panel.'
          : 'Dira berusaha mencari petunjuk sosial di sekitar kotak besi, namun tidak menyadari tuas pengunci fisik yang tersembunyi.',
      lesson:
        'Pemeriksaan detail benda fisik dan penemuan celah tersembunyi adalah keahlian utama Nino melalui Curiosity Trigger.',
      chosenCharacter: chosen,
      recommendedSkill: 'Curiosity Trigger',
      questLabel: 'Wilayah 2 · Sandang Ayu Plaza',
    }),
  },
  empathy_raka: {
    requiredChar: 'dira',
    requiredSkill: 'Social Empathy',
    questLabel: 'Wilayah 2 · Sandang Ayu Plaza',
    scenarioTitle: 'Pilih Anggota Tim untuk Mendekati Raka',
    scenarioDesc:
      'Pemuda di depan layar hologram tampak gelisah, defensif, dan menolak diganggu orang asing. Siapa anggota tim yang paling tepat membuka hatinya agar mau berbagi cerita?',
    buildGameOver: (chosen) => ({
      title: 'Raka Menutup Diri & Menjauh',
      cause:
        chosen === 'nino'
          ? 'Pertanyaan Nino yang terlalu blak-blakan membuat Raka tersinggung dan langsung pergi menjauhi pelataran plaza.'
          : 'Ilyas langsung menanyakan data teknis layar hologram sehingga Raka merasa diinterogasi dan berhenti bicara.',
      lesson:
        'Menghadapi warga atau pelajar yang defensif akibat tekanan sosial membutuhkan kepekaan perasaan—keahlian Dira lewat Social Empathy.',
      chosenCharacter: chosen,
      recommendedSkill: 'Social Empathy',
      questLabel: 'Wilayah 2 · Sandang Ayu Plaza',
    }),
  },
  empathy_wiryo: {
    requiredChar: 'dira',
    requiredSkill: 'Social Empathy',
    questLabel: 'Wilayah 3 · Sanggar Darmoyudho',
    scenarioTitle: 'Pilih Anggota Tim untuk Meyakinkan Pak Wiryo',
    scenarioDesc:
      'Seniman sanggar ini merasa terpukul karena panggung tradisional semakin ditinggalkan dan ragu bekerja sama dengan orang luar. Siapa yang tepat membaca perasaannya?',
    buildGameOver: (chosen) => ({
      title: 'Sanggar Ditutup Permanen',
      cause:
        chosen === 'nino'
          ? 'Komentar Nino yang terlalu blak-blakan membuat Pak Wiryo merasa tradisi sanggar dianggap kuno dan tidak dihargai.'
          : 'Pendekatan Ilyas yang penuh istilah sistem membuat Pak Wiryo kewalahan dan menutup pembicaraan sebelum membuka sanggar.',
      lesson:
        'Meyakinkan warga atau seniman yang terpukul perubahan sosial membutuhkan kepekaan empati—tugas utama Dira dengan Social Empathy.',
      chosenCharacter: chosen,
      recommendedSkill: 'Social Empathy',
      questLabel: 'Wilayah 3 · Sanggar Darmoyudho',
    }),
  },
  curiosity_panel: {
    requiredChar: 'nino',
    requiredSkill: 'Curiosity Trigger',
    questLabel: 'Wilayah 3 · Sanggar Darmoyudho',
    scenarioTitle: 'Pilih Anggota Tim untuk Menggeledah Kotak Panel',
    scenarioDesc:
      'Menurut petunjuk kurator, Kartu Akses Server Kota disembunyikan di dalam kotak panel tata suara yang berdebu ini. Siapa yang jeli menemukan barang tersembunyi?',
    buildGameOver: (chosen) => ({
      title: 'Kompartemen Rahasia Gagal Ditemukan',
      cause:
        chosen === 'ilyas'
          ? 'Ilyas mencoba memindai kotak kayu analog memakai perangkat digitalnya, namun tidak ada sinyal elektronik yang terbaca hingga panel macet.'
          : 'Dira memeriksa bagian luar kotak dengan sopan tanpa menelusuri celah kabel tersembunyi di balik papan tata suara.',
      lesson:
        'Mengamati detail lingkungan dan menggeledah benda fisik untuk mencari barang tersembunyi merupakan keahlian Nino (Curiosity Trigger).',
      chosenCharacter: chosen,
      recommendedSkill: 'Curiosity Trigger',
      questLabel: 'Wilayah 3 · Sanggar Darmoyudho',
    }),
  },
  hacking_kiosk: {
    requiredChar: 'ilyas',
    requiredSkill: 'Data Hacking',
    questLabel: 'Wilayah 3 · Sanggar Darmoyudho',
    scenarioTitle: 'Pilih Anggota Tim untuk Konfigurasi Kios Digital',
    scenarioDesc:
      'Kios jadwal penyiaran panggung terkunci oleh skrip routing kota. Kesalahan akses akan memutus jalur penyiaran sanggar. Siapa yang akan kamu tugaskan?',
    buildGameOver: (chosen) => ({
      title: 'Kios Penyiaran Mengalami Korsleting Sistem',
      cause:
        chosen === 'nino'
          ? 'Nino mencoba menyambung ulang modul kiosk secara manual tanpa dekripsi sistem sehingga jalur siaran sanggar terkunci permanen.'
          : 'Dira mencoba memodifikasi parameter teknis penyiaran, tetapi sistem keamanan kios langsung memblokir seluruh jadwal festival.',
      lesson:
        'Modifikasi parameter perangkat lunak penyiaran dan aturan indeks digital harus ditangani Ilyas menggunakan Data Hacking.',
      chosenCharacter: chosen,
      recommendedSkill: 'Data Hacking',
      questLabel: 'Wilayah 3 · Sanggar Darmoyudho',
    }),
  },
  hacking_gate: {
    requiredChar: 'ilyas',
    requiredSkill: 'Data Hacking',
    questLabel: 'Wilayah 4 · Terminal Server Kota',
    scenarioTitle: 'Pilih Anggota Tim untuk Menembus Gerbang Firewall',
    scenarioDesc:
      'Firewall lapis tiga berkode biner melindungi jalur masuk menuju inti Server Kota. Menugaskan anggota tim yang keliru akan memicu alarm penguncian total ruangan.',
    buildGameOver: (chosen) => ({
      title: 'Alarm Penguncian Terminal Server Aktif',
      cause:
        chosen === 'nino'
          ? 'Nino memicu sensor intrusi fisik saat mengutak-atik gerbang data, membuat pintu besi server langsung menutup.'
          : 'Dira tidak dapat menembus enkripsi checksum biner sehingga gerbang keamanan memutus seluruh daya konsol.',
      lesson:
        'Penetrasi firewall dan penyeimbangan checksum biner memerlukan ketelitian analitis Ilyas lewat keahlian Data Hacking.',
      chosenCharacter: chosen,
      recommendedSkill: 'Data Hacking',
      questLabel: 'Wilayah 4 · Terminal Server Kota',
    }),
  },
  hacking_log: {
    requiredChar: 'ilyas',
    requiredSkill: 'Data Hacking',
    questLabel: 'Wilayah 4 · Terminal Server Kota',
    scenarioTitle: 'Pilih Anggota Tim untuk Dekripsi Log Sistem',
    scenarioDesc:
      'Log rekomendasi pengguna terenkripsi dalam format heksadesimal berlapis. Menjalankan dekripsi dengan karakter yang salah akan memicu protokol penghapusan otomatis.',
    buildGameOver: (chosen) => ({
      title: 'Protokol Penghapusan Log Terpicu',
      cause:
        chosen === 'nino'
          ? 'Nino menjalankan perintah dekripsi acak pada konsol inti; sistem keamanan mendeteksi akses ilegal dan menghapus data.'
          : 'Dira mencoba membaca file terenkripsi tanpa kunci digital sehingga server langsung mengisolasi catatan sistem.',
      lesson:
        'Dekripsi paket heksadesimal dan pembacaan log sistem wajib dilakukan oleh Ilyas dengan keahlian Data Hacking.',
      chosenCharacter: chosen,
      recommendedSkill: 'Data Hacking',
      questLabel: 'Wilayah 4 · Terminal Server Kota',
    }),
  },
};

export const CharacterPuzzlesModal: React.FC<CharacterPuzzleProps> = ({
  mode,
  activeCharacter,
  onSelectCharacter,
  onWrongCharacter,
  onSuccess,
  onClose,
}) => {
  const dispatchRule = DISPATCH_RULES[mode];
  const [phase, setPhase] = useState<'dispatch' | 'puzzle'>(dispatchRule ? 'dispatch' : 'puzzle');
  const [pickedChar, setPickedChar] = useState<PlayableCharacterId>(activeCharacter);

  // Nino Curiosity State
  const [foundAnomalies, setFoundAnomalies] = useState<string[]>([]);
  const [curiosityMsg, setCuriosityMsg] = useState<string | null>(null);

  // Dira Empathy State (Raka & Pak Wiryo)
  const [empathyStep, setEmpathyStep] = useState(0);
  const [empathyFeedback, setEmpathyFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  // Ilyas Firewall Hacking State
  const [bits, setBits] = useState<boolean[][]>([
    [true, false, false, false],
    [false, true, false, false],
    [false, false, true, false],
  ]);
  const [hackError, setHackError] = useState<string | null>(null);

  // Ilyas Kiosk Scheduler State
  const [kioskRules, setKioskRules] = useState<{
    enableLocalTag: boolean;
    capRepeat: boolean;
    hybridCollab: boolean;
  }>({
    enableLocalTag: false,
    capRepeat: false,
    hybridCollab: false,
  });

  // Ilyas Log Decryption State
  const [selectedKeys, setSelectedKeys] = useState<Record<string, string>>({});

  const [done, setDone] = useState(false);

  const finishWithDelay = () => {
    soundEngine.playSfx('correct');
    setDone(true);
    window.setTimeout(() => {
      onSuccess();
    }, 900);
  };

  const handleConfirmDispatch = () => {
    if (!dispatchRule) return;
    onSelectCharacter(pickedChar);
    if (pickedChar !== dispatchRule.requiredChar) {
      soundEngine.playSfx('gameover');
      onWrongCharacter(dispatchRule.buildGameOver(pickedChar));
      return;
    }
    soundEngine.playSfx('correct');
    setPhase('puzzle');
  };

  // Handler: Nino Curiosity Panel (access card)
  const togglePanelClue = (clueId: string, isClue: boolean) => {
    if (done) return;
    if (!isClue) {
      soundEngine.playSfx('wrong');
      setCuriosityMsg('Itu sekring lampu biasa. Periksa detail yang tampak diselipkan tersembunyi.');
      return;
    }
    soundEngine.playSfx('clue');
    setCuriosityMsg(null);
    setFoundAnomalies((prev) => {
      const next = prev.includes(clueId) ? prev : [...prev, clueId];
      if (next.length === 2) {
        finishWithDelay();
      }
      return next;
    });
  };

  // Handler: Nino Curiosity Relay
  const toggleRelayNode = (nodeId: string, isAnomaly: boolean) => {
    if (done) return;
    if (!isAnomaly) {
      soundEngine.playSfx('wrong');
      setCuriosityMsg('Itu hanya komponen normal penerangan plaza. Cari modul yang memanipulasi siaran publik.');
      return;
    }
    soundEngine.playSfx('clue');
    setCuriosityMsg(null);
    setFoundAnomalies((prev) => {
      const next = prev.includes(nodeId) ? prev : [...prev, nodeId];
      if (next.length === 3) {
        finishWithDelay();
      }
      return next;
    });
  };

  // Handler: Dira Empathy (both Raka & Pak Wiryo)
  const empathySteps = mode === 'empathy_wiryo' ? WIRYO_EMPATHY_STEPS : RAKA_EMPATHY_STEPS;
  const empathyNpcName = mode === 'empathy_wiryo' ? 'Pak Wiryo' : 'Raka';

  const chooseEmpathy = (isEmpathetic: boolean, feedback: string) => {
    if (done) return;
    if (!isEmpathetic) {
      soundEngine.playSfx('wrong');
      setEmpathyFeedback({ ok: false, text: feedback });
      return;
    }
    soundEngine.playSfx('correct');
    setEmpathyFeedback({ ok: true, text: feedback });
    if (empathyStep + 1 < empathySteps.length) {
      window.setTimeout(() => {
        setEmpathyStep((s) => s + 1);
        setEmpathyFeedback(null);
      }, 800);
    } else {
      finishWithDelay();
    }
  };

  // Handler: Ilyas Binary Firewall
  const toggleBit = (rIdx: number, bIdx: number) => {
    if (done) return;
    soundEngine.playSfx('click');
    setHackError(null);
    setBits((prev) =>
      prev.map((row, ri) => (ri === rIdx ? row.map((v, bi) => (bi === bIdx ? !v : v)) : row))
    );
  };

  const verifyHackingGate = () => {
    const allMatch = HACK_ROWS.every((row, ri) => {
      const sum = row.values.reduce((acc, val, bi) => (bits[ri][bi] ? acc + val : acc), 0);
      return sum === row.target;
    });
    if (!allMatch) {
      soundEngine.playSfx('wrong');
      setHackError('Checksum biner belum cocok dengan nilai target di setiap baris.');
      return;
    }
    finishWithDelay();
  };

  const verifyKiosk = () => {
    if (!kioskRules.enableLocalTag || !kioskRules.capRepeat || !kioskRules.hybridCollab) {
      soundEngine.playSfx('wrong');
      setHackError('Aktifkan ketiga perbaikan penjadwalan agar acara pendopo bisa tayang di layar kota.');
      return;
    }
    finishWithDelay();
  };

  const verifyLogDecryption = () => {
    const allChosen = LOG_PACKETS.every((pkt) => Boolean(selectedKeys[pkt.id]));
    if (!allChosen) {
      soundEngine.playSfx('wrong');
      setHackError('Pilih protokol kunci dekripsi untuk ketiga paket log terenkripsi terlebih dahulu.');
      return;
    }
    const allCorrect = LOG_PACKETS.every((pkt) => selectedKeys[pkt.id] === pkt.correctKey);
    if (!allCorrect) {
      soundEngine.playSfx('wrong');
      setHackError('Ada kunci dekripsi yang belum sesuai isi paket heksadesimal. Cocokkan petunjuk setiap blok log.');
      return;
    }
    finishWithDelay();
  };

  const headerMeta =
    mode === 'curiosity_plaza'
      ? {
          icon: Eye,
          color: 'text-red-300',
          border: 'border-red-400/35',
          portrait: ASSETS.portraitNino,
          title: 'Curiosity Trigger — Inspeksi Panel Relay Plaza',
          subtitle: 'Nino menemukan panel kabel tersembunyi. Temukan 3 modul yang menekan informasi lokal.',
        }
      : mode === 'empathy_raka'
      ? {
          icon: HeartHandshake,
          color: 'text-rose-300',
          border: 'border-rose-400/35',
          portrait: ASSETS.portraitDira,
          title: 'Social Empathy — Membangun Kepercayaan Raka',
          subtitle: 'Dira membaca emosi Raka dan memilih respons yang membuatnya nyaman terbuka.',
        }
      : mode === 'empathy_wiryo'
      ? {
          icon: HeartHandshake,
          color: 'text-rose-300',
          border: 'border-rose-400/35',
          portrait: ASSETS.portraitDira,
          title: 'Social Empathy — Meyakinkan Pak Wiryo (Quest 3)',
          subtitle: 'Dengarkan keresahan seniman pendopo dan yakinkan Pak Wiryo untuk membuka panggung kembali.',
        }
      : mode === 'hacking_gate'
      ? {
          icon: Terminal,
          color: 'text-sky-300',
          border: 'border-sky-400/35',
          portrait: ASSETS.portraitIlyas,
          title: 'Data Hacking — Dekripsi Checksum Firewall (Quest 4)',
          subtitle: 'Samakan jumlah bit setiap baris dengan Target Checksum untuk membuka gerbang server.',
        }
      : mode === 'hacking_log'
      ? {
          icon: KeyRound,
          color: 'text-cyan-300',
          border: 'border-cyan-400/35',
          portrait: ASSETS.portraitIlyas,
          title: 'Data Hacking — Dekripsi Log Algoritma Kota (Quest 4)',
          subtitle: 'Urai 3 paket log heksadesimal terenkripsi sebelum menganalisis pola ruang gema.',
        }
      : mode === 'curiosity_panel'
      ? {
          icon: LockOpen,
          color: 'text-red-300',
          border: 'border-red-400/35',
          portrait: ASSETS.portraitNino,
          title: 'Curiosity Trigger — Menggeledah Kotak Panel Suara',
          subtitle: 'Nino menemukan 2 petunjuk tersembunyi di balik gulungan kabel panel tata suara.',
        }
      : {
          icon: Terminal,
          color: 'text-cyan-300',
          border: 'border-cyan-400/35',
          portrait: ASSETS.portraitIlyas,
          title: 'Data Hacking — Kios Siaran Jadwal Sanggar Darmoyudho',
          subtitle: 'Perbaiki konfigurasi kios digital agar acara budaya tampil di layar kota.',
        };

  const HeaderIcon = headerMeta.icon;
  const isBlindDispatch = phase === 'dispatch' && Boolean(dispatchRule);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/88 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border ${
          isBlindDispatch ? 'border-amber-400/35' : headerMeta.border
        } shadow-2xl p-6 space-y-5`}
      >
        {/* Header (Neutral during blind dispatch so character identity/skill is never spoiled!) */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5">
            {isBlindDispatch ? (
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-400/35 flex items-center justify-center text-amber-300 shrink-0">
                <Users className="w-6 h-6" />
              </div>
            ) : (
              <img
                src={headerMeta.portrait}
                alt={headerMeta.title}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover object-top border border-white/15 shrink-0"
              />
            )}
            <div>
              <div
                className={`flex items-center gap-1.5 text-xs font-semibold ${
                  isBlindDispatch ? 'text-amber-300' : headerMeta.color
                }`}
              >
                {isBlindDispatch ? (
                  <Users className="w-3.5 h-3.5" />
                ) : (
                  <HeaderIcon className="w-3.5 h-3.5" />
                )}
                <span>
                  {isBlindDispatch ? 'Penugasan Karakter Tim' : 'Aksi Kemampuan Karakter'}
                </span>
              </div>
              <h2 className="font-display text-lg md:text-xl font-bold text-white">
                {isBlindDispatch && dispatchRule ? dispatchRule.scenarioTitle : headerMeta.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBlindDispatch && dispatchRule ? dispatchRule.scenarioDesc : headerMeta.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PHASE 0: CHARACTER ASSIGNMENT DISPATCH (QUEST 3 & QUEST 4 — GAME OVER ON WRONG PICK) */}
        {phase === 'dispatch' && dispatchRule && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 rounded-xl bg-amber-950/45 border border-amber-400/35 px-3.5 py-2.5 text-xs text-amber-100">
              <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                Peringatan: Menugaskan karakter dengan keahlian yang salah pada tahap ini akan menggagalkan misi (Game Over).
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CHARACTER_PROFILES.map((profile) => {
                const selected = pickedChar === profile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playSfx('click');
                      setPickedChar(profile.id);
                    }}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                      selected
                        ? 'bg-sky-950/65 border-sky-400 text-white shadow-lg'
                        : 'bg-slate-800/70 border-white/10 text-slate-300 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={profile.portraitUrl}
                        alt={profile.nickname}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover object-top border border-white/20 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{profile.nickname}</p>
                        <p className="text-[11px] font-semibold" style={{ color: profile.accentHex }}>
                          {profile.abilityName}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{profile.abilityDesc}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
              <span className="text-xs text-slate-400">
                Terpilih: <strong className="text-white capitalize">{pickedChar}</strong>
              </span>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold cursor-pointer whitespace-nowrap"
              >
                Tugaskan Karakter Ini
              </button>
            </div>
          </div>
        )}

        {/* MODE 1: NINO CURIOSITY */}
        {phase === 'puzzle' && mode === 'curiosity_plaza' && (
          <div className="space-y-4">
            <p className="text-xs font-medium text-red-300">
              Anomali terdeteksi: {foundAnomalies.length} / 3
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {RELAY_NODES.map((node) => {
                const picked = foundAnomalies.includes(node.id);
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => toggleRelayNode(node.id, node.isAnomaly)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      picked
                        ? 'bg-red-950/60 border-red-400 text-white'
                        : 'bg-slate-800/75 border-white/10 text-slate-200 hover:border-red-400/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{node.title}</span>
                      {picked && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{node.desc}</p>
                  </button>
                );
              })}
            </div>
            {curiosityMsg && (
              <p className="text-xs text-amber-300 bg-amber-950/40 border border-amber-400/40 rounded-lg p-3">
                {curiosityMsg}
              </p>
            )}
          </div>
        )}

        {/* MODE 1B: NINO CURIOSITY PANEL */}
        {phase === 'puzzle' && mode === 'curiosity_panel' && (
          <div className="space-y-4">
            <p className="text-xs font-medium text-red-300">
              Petunjuk panel ditemukan: {foundAnomalies.length} / 2
            </p>
            <div className="grid grid-cols-1 gap-3">
              {PANEL_CLUES.map((node) => {
                const picked = foundAnomalies.includes(node.id);
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => togglePanelClue(node.id, node.isClue)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      picked
                        ? 'bg-red-950/60 border-red-400 text-white'
                        : 'bg-slate-800/75 border-white/10 text-slate-200 hover:border-red-400/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{node.title}</span>
                      {picked && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{node.desc}</p>
                  </button>
                );
              })}
            </div>
            {curiosityMsg && (
              <p className="text-xs text-amber-300 bg-amber-950/40 border border-amber-400/40 rounded-lg p-3">
                {curiosityMsg}
              </p>
            )}
          </div>
        )}

        {/* MODE 2 & 3: DIRA SOCIAL EMPATHY (RAKA & PAK WIRYO) */}
        {phase === 'puzzle' && (mode === 'empathy_raka' || mode === 'empathy_wiryo') && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-950/80 border border-white/10 p-4 space-y-2">
              <p className="text-xs text-rose-300 font-medium">
                Tahap Pendekatan {empathyStep + 1} / {empathySteps.length} · {empathySteps[empathyStep].npcMood}
              </p>
              <p className="text-sm md:text-base text-white font-medium">
                {empathyNpcName}: {empathySteps[empathyStep].npcLine}
              </p>
            </div>

            <div className="space-y-2.5">
              {empathySteps[empathyStep].options.map((opt) => (
                <button
                  key={opt.text}
                  type="button"
                  onClick={() => chooseEmpathy(opt.isEmpathetic, opt.feedback)}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/50 border border-white/10 hover:border-rose-400/60 text-sm text-slate-100 cursor-pointer transition-colors"
                >
                  {opt.text}
                </button>
              ))}
            </div>

            {empathyFeedback && (
              <div
                className={`rounded-xl p-3.5 border flex items-start gap-2.5 text-sm ${
                  empathyFeedback.ok
                    ? 'bg-emerald-950/50 border-emerald-400/50 text-emerald-100'
                    : 'bg-rose-950/50 border-rose-400/50 text-rose-100'
                }`}
              >
                {empathyFeedback.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{empathyFeedback.text}</span>
              </div>
            )}
          </div>
        )}

        {/* MODE 4: ILYAS BINARY FIREWALL HACKING */}
        {phase === 'puzzle' && mode === 'hacking_gate' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {HACK_ROWS.map((row, ri) => {
                const currentSum = row.values.reduce(
                  (acc, val, bi) => (bits[ri][bi] ? acc + val : acc),
                  0
                );
                const matched = currentSum === row.target;
                return (
                  <div
                    key={row.label}
                    className="rounded-xl bg-slate-950/80 border border-white/10 p-3.5 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-sky-300">{row.label}</p>
                      <p className="font-mono-data text-xs text-slate-300 mt-0.5">
                        Jumlah: <strong className={matched ? 'text-emerald-400' : 'text-amber-300'}>{currentSum}</strong> / Target: {row.target}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {row.values.map((val, bi) => {
                        const active = bits[ri][bi];
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => toggleBit(ri, bi)}
                            className={`w-11 h-11 rounded-lg font-mono-data text-sm font-bold border transition-colors cursor-pointer ${
                              active
                                ? 'bg-sky-600 border-sky-300 text-white'
                                : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            +{val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            {hackError && (
              <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-400/40 rounded-lg p-3">
                {hackError}
              </p>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={verifyHackingGate}
                disabled={done}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold cursor-pointer"
              >
                Eksekusi Bypass Firewall
              </button>
            </div>
          </div>
        )}

        {/* MODE 5: ILYAS STAGE KIOSK SCHEDULER */}
        {phase === 'puzzle' && mode === 'hacking_kiosk' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Aktifkan parameter penjadwalan yang adil agar acara budaya lokal muncul di layar kota:
            </p>
            <div className="space-y-2.5">
              {[
                {
                  key: 'enableLocalTag' as const,
                  label: 'Buka Indeks Acara Budaya Lokal di Beranda Plaza',
                  desc: 'Mengembalikan visibilitas jadwal gamelan & tari daerah.',
                },
                {
                  key: 'capRepeat' as const,
                  label: 'Batasi Dominasi Konten Viral Seragam Maksimal 50%',
                  desc: 'Mencegah algoritma menenggelamkan kegiatan komunitas.',
                },
                {
                  key: 'hybridCollab' as const,
                  label: 'Publikasikan Undangan Kolaborasi Musik Muda & Tradisional',
                  desc: 'Menghubungkan seniman pendopo dengan pelajar Neo-Metropolis.',
                },
              ].map((item) => {
                const checked = kioskRules[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      soundEngine.playSfx('click');
                      setHackError(null);
                      setKioskRules((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                      checked
                        ? 'bg-cyan-950/60 border-cyan-400 text-white'
                        : 'bg-slate-800/75 border-white/10 text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <span className="font-mono-data text-xs px-2.5 py-1 rounded bg-slate-950 border border-white/10 shrink-0">
                      {checked ? 'AKTIF' : 'MATI'}
                    </span>
                  </button>
                );
              })}
            </div>
            {hackError && (
              <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-400/40 rounded-lg p-3">
                {hackError}
              </p>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={verifyKiosk}
                disabled={done}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold cursor-pointer"
              >
                Terapkan Konfigurasi Kios
              </button>
            </div>
          </div>
        )}

        {/* MODE 6: ILYAS LOG DECRYPTION CIPHER (QUEST 4) */}
        {phase === 'puzzle' && mode === 'hacking_log' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {LOG_PACKETS.map((pkt) => {
                const chosenKey = selectedKeys[pkt.id];
                const isDecoded = chosenKey === pkt.correctKey;
                return (
                  <div
                    key={pkt.id}
                    className="rounded-xl bg-slate-950/85 border border-white/10 p-3.5 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono-data text-xs font-bold text-cyan-300">{pkt.code}</span>
                      <span className="font-mono-data text-[11px] text-slate-400">
                        {isDecoded ? 'STATUS: TERDEKRIPSI' : 'STATUS: TERENKRIPSI'}
                      </span>
                    </div>
                    <p className="font-mono-data text-xs text-slate-300 bg-slate-900/90 rounded-lg px-3 py-2 border border-white/5">
                      {isDecoded ? pkt.decodedText : `HEX: ${pkt.encryptedHex}`}
                    </p>
                    <p className="text-xs text-slate-400">{pkt.hint}</p>
                    <div className="flex flex-wrap gap-2">
                      {pkt.keyOptions.map((keyName) => {
                        const active = chosenKey === keyName;
                        return (
                          <button
                            key={keyName}
                            type="button"
                            disabled={done}
                            onClick={() => {
                              soundEngine.playSfx('click');
                              setHackError(null);
                              setSelectedKeys((prev) => ({ ...prev, [pkt.id]: keyName }));
                            }}
                            className={`px-3 py-1.5 rounded-lg font-mono-data text-[11px] border transition-colors cursor-pointer ${
                              active
                                ? keyName === pkt.correctKey
                                  ? 'bg-emerald-600/80 border-emerald-300 text-white'
                                  : 'bg-sky-600 border-sky-300 text-white'
                                : 'bg-slate-800 border-white/10 text-slate-300 hover:text-white'
                            }`}
                          >
                            {keyName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            {hackError && (
              <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-400/40 rounded-lg p-3">
                {hackError}
              </p>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={verifyLogDecryption}
                disabled={done}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold cursor-pointer"
              >
                Dekripsi & Buka Analisis Log
              </button>
            </div>
          </div>
        )}

        {done && (
          <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/50 border border-emerald-400/40 rounded-lg p-3 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Tantangan berhasil diselesaikan! Progres investigasi diperbarui.</span>
          </div>
        )}
      </div>
    </div>
  );
};
