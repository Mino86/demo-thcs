import fs from 'fs';
import path from 'path';
import { Exam, MaterialPassage, QuestionBankItem, TeacherDocument, AppSettings } from '../src/types/index.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const EXAMS_FILE = path.join(DATA_DIR, 'exams.json');
const MATERIALS_FILE = path.join(DATA_DIR, 'materials.json');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function readFileSafe<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeFileSafe<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Default initial settings
const DEFAULT_SETTINGS: AppSettings = {
  schoolName: 'THCS Nguyễn Du',
  districtName: 'Phòng GD&ĐT Quận Hoàn Kiếm - Hà Nội',
  departmentName: 'Tổ Ngữ Văn',
  teacherName: 'Nguyễn Thị Thu Hà',
  schoolYear: '2024 - 2025',
  defaultDuration: 90,
  defaultReadingRatio: 6,
  defaultWritingRatio: 4,
  fontFamily: 'Times New Roman',
  fontSize: 13,
};

// Seed materials (Ngữ liệu chuẩn ngoài SGK theo chỉ đạo BGDĐT Công văn 3175)
const SEED_MATERIALS: MaterialPassage[] = [
  {
    id: 'mat-001',
    title: 'Gió lạnh đầu mùa (Đoạn trích ấm áp tình người)',
    author: 'Thạch Lam',
    source: 'Tập truyện ngắn "Gió lạnh đầu mùa", NXB Đời Nay, 1937',
    genre: 'Truyện ngắn hiện đại',
    grade: '6',
    textbook: 'kntt',
    theme: 'Tình cảm gia đình, lòng nhân ái sẻ chia',
    content: `Buổi sáng hôm nay, mùa đông đột nhiên đến, không báo cho biết trước. Vừa mới ngày hôm qua giời hãy còn nắng ấm và hanh, cái nắng về cuối tháng mười làm nứt nẻ đất ruộng và làm giòn khô những chiếc lá rơi. Sơn bừng mắt dậy, thấy chung quanh ấm áp như mọi ngày, chỉ nghe ngoài vườn tiếng gió vi vu làm cho các cành bàng lá đỏ rụng xuống rào rào.

Sơn co ro một lát rồi mở mắt nhìn ra ngoài. Mấy chiếc chăn dạ bóng nhẫy và đệm bông mới bọc vải hoa trắng đã được xếp gọn ghẽ ở góc giường. Trời xám xịt và có gió rít. Mẹ Sơn đang ngồi sưởi cạnh chiếc lò than hoa, trên chõng tre có mấy cái áo bông cũ đã sờn rách.

Sơn và chị Lan xúng xính trong những chiếc áo ấm đẹp đẽ bước ra ngõ. Gặp thằng Duyên, con bé Túc, đứa nào đứa nấy môi tím tái, manh áo rách để hở cả lưng và ngực. Thấy Hiên, con bé nghèo nhất xóm, chỉ mặc độc một manh áo rách tả tơi, đứng co ro bên gốc đa, Sơn chợt thấy thương quá. Sơn bàn thầm với chị Lan về nhà lấy chiếc áo bông cũ của em Duyên đem cho Hiên...`,
    wordCount: 220,
    tags: ['Lòng nhân ái', 'Truyện ngắn', 'Tình người trong mùa đông', 'Lớp 6'],
    isVerified: true,
    createdAt: '2024-11-01T08:00:00Z',
  },
  {
    id: 'mat-002',
    title: 'Mẹ (Thơ lục bát giàu cảm xúc)',
    author: 'Đỗ Trung Lai',
    source: 'Tập thơ "Đêm sông Cầu", NXB Quân đội Nhân dân, 2003',
    genre: 'Thơ lục bát',
    grade: '7',
    textbook: 'ctst',
    theme: 'Tình mẫu tử, sự hy sinh thầm lặng của mẹ',
    content: `Lưng mẹ còng rồi
Cau thì vẫn thẳng
Cau - ngọn xanh rờn
Mẹ - đầu bạc trắng.

Cau ngày càng cao
Mẹ ngày một thấp
Cau gần với giời
Mẹ thì gần đất!

Một miếng cau khô
Khô gầy như mẹ
Con nâng trên tay
Không cầm được lệ.

Ngẩng đầu hỏi giời:
- Sao mẹ ta già?
Không một lời đáp
Mây bay về xa.`,
    wordCount: 76,
    tags: ['Tình mẹ', 'Thơ lục bát', 'Hình ảnh đối lập', 'Lớp 7'],
    isVerified: true,
    createdAt: '2024-11-02T09:00:00Z',
  },
  {
    id: 'mat-003',
    title: 'Bàn tay của cha (Tản văn về tình phụ tử)',
    author: 'Nguyễn Quang Thiều',
    source: 'Tạp chí Văn nghệ Quân đội, số 890, 2018',
    genre: 'Tản văn - Tùy bút',
    grade: '8',
    textbook: 'canh_dieu',
    theme: 'Tình phụ tử, đức hy sinh và lòng biết ơn',
    content: `Bàn tay cha tôi thô ráp, chai sần, những ngón tay gồ ghề vẹo vọ như những rễ cây bám chặt vào sỏi đá quê nghèo. Đôi bàn tay ấy suốt một đời cầm cày, cầm cuốc, phơi mình dưới những trưa hè rực lửa và những đêm đông buốt giá sương muối.

Có lần tôi ốm nặng, sốt mê man, cha ngồi bên giường suốt đêm. Mỗi lần cha đặt bàn tay ram ráp lên trán tôi, tôi thấy một cảm giác mát lành và tin cậy đến lạ lùng. Bàn tay thô kệch ấy nâng niu từng thìa cháo loãng, vụng về vuốt lại vạt chăn cho tôi. Trong ký ức tuổi thơ tôi, thế giới rộng lớn biết bao nhiêu đều thu nhỏ lại vừa vặn trong hơi ấm từ bàn tay của cha.

Giờ đây khôn lớn, nắm lấy bàn tay gầy gò của cha đã run rẩy theo năm tháng, tôi mới hiểu hết: những vết nứt nẻ trên da thịt người chính là những bậc thang nâng bước cuộc đời tôi đi tới ngày mai.`,
    wordCount: 185,
    tags: ['Tình phụ tử', 'Tản văn', 'Biện pháp tu từ', 'Lớp 8'],
    isVerified: true,
    createdAt: '2024-11-03T10:00:00Z',
  },
  {
    id: 'mat-004',
    title: 'Bếp lửa (Trích đoạn cảm nghĩ)',
    author: 'Bằng Việt',
    source: 'Tập thơ "Hương cây - Bếp lửa", NXB Văn học, 1968',
    genre: 'Thơ tự do',
    grade: '9',
    textbook: 'kntt',
    theme: 'Tình bà cháu, đạo lý Uống nước nhớ nguồn',
    content: `Một bếp lửa chờn vờn sương sớm
Một bếp lửa ấp iu nồng đượm
Cháu thương bà biết mấy nắng mưa!

Lên bốn tuổi cháu đã quen mùi khói
Năm ấy là năm đói mòn đói mỏi
Bố đi đánh xe khô rạc ngựa gầy
Chỉ nhớ khói hun nhèm mắt cháu
Nghĩ lại đến giờ sống mũi còn cay!

Tám năm ròng cháu cùng bà nhóm lửa
Huy hoàng thay ngọn lửa trong lòng bà
Bà hay kể chuyện những ngày ở Huế
Tiếng chim tu hú tha thiết kêu xa...

Rồi sớm rồi chiều lại bếp lửa bà nhen
Một ngọn lửa lòng bà luôn ủ sẵn
Một ngọn lửa chứa niềm tin dai dẳng...`,
    wordCount: 110,
    tags: ['Tình bà cháu', 'Bếp lửa', 'Thơ hiện đại', 'Lớp 9'],
    isVerified: true,
    createdAt: '2024-11-04T11:00:00Z',
  },
  {
    id: 'mat-005',
    title: 'Ý chí và nghị lực sống của con người',
    author: 'Trần Đăng',
    source: 'Báo Tuổi Trẻ Online, chuyên mục Góc nhìn Giáo dục, 2022',
    genre: 'Văn bản nghị luận xã hội',
    grade: '8',
    textbook: 'ctst',
    theme: 'Lối sống đẹp, rèn luyện bản lĩnh vượt khó',
    content: `Cuộc sống không bao giờ là một thảm hoa hồng trải dài êm ái. Trên con đường đi tới ước mơ, mỗi chúng ta đều phải đối mặt với những ghềnh thác, những thử thách khắc nghiệt. Người có ý chí và nghị lực sẽ nhìn khó khăn như một cơ hội để tôi luyện bản lĩnh, như ngọn lửa thử vàng, gian nan thử sức.

Thất bại không đáng sợ. Điều đáng sợ nhất là thái độ buông xuôi, chấp nhận đầu hàng số phận ngay từ khi chưa bắt đầu nỗ lực. Hãy nhìn những mầm cây vươn lên từ kẽ nứt của phiến đá khô cằn: chúng không đợi chờ mưa thuận gió hòa mới đâm chồi, mà kiên cường chắt chiu từng giọt sương đêm để trổ hoa. Con người cũng vậy, chính sự kiên trì và lòng dũng cảm sẽ thắp sáng tương lai của mỗi chúng ta.`,
    wordCount: 160,
    tags: ['Nghị luận xã hội', 'Nghị lực sống', 'Lối sống đẹp', 'Lớp 8'],
    isVerified: true,
    createdAt: '2024-11-05T14:00:00Z',
  },
  {
    id: 'mat-006',
    title: 'Bảo vệ nguồn nước sạch - Trách nhiệm của cộng đồng',
    author: 'Ths. Lê Hoàng Nam',
    source: 'Cổng thông tin Điện tử Bộ Tài nguyên và Môi trường, 2023',
    genre: 'Văn bản thông tin',
    grade: '7',
    textbook: 'canh_dieu',
    theme: 'Môi trường sống, phát triển bền vững',
    content: `Nước ngọt chỉ chiếm khoảng 2.5% tổng lượng nước trên toàn cầu, trong đó phần lớn lại bị đóng băng ở hai cực hoặc nằm sâu dưới lòng đất. Hiện nay, cùng với sự gia tăng dân số nhanh chóng và quá trình công nghiệp hóa ồ ạt, nguồn tài nguyên quý giá này đang bị đe dọa nghiêm trọng do ô nhiễm rác thải nhựa, hóa chất độc hại và nước thải sinh hoạt chưa qua xử lý.

Bảo vệ nguồn nước không phải là công việc vĩ mô xa vời mà bắt đầu từ chính hành động hàng ngày của mỗi học sinh: khóa chặt vòi nước sau khi dùng, không xả rác bừa bãi xuống ao hồ sông suối, và tích cực tuyên truyền tới người thân. Giữ cho dòng nước trong lành chính là bảo vệ mạch nguồn sự sống của chính chúng ta hôm nay và mai sau.`,
    wordCount: 165,
    tags: ['Văn bản thông tin', 'Môi trường', 'Nước sạch', 'Lớp 7'],
    isVerified: true,
    createdAt: '2024-11-06T15:00:00Z',
  }
];

// Seed questions
const SEED_QUESTIONS: QuestionBankItem[] = [
  {
    id: 'q-001',
    grade: '6',
    strand: 'doc_hieu',
    cognitiveLevel: 'nhan_biet',
    questionType: 'trac_nghiem',
    genre: 'Thơ lục bát',
    prompt: 'Thể thơ lục bát gồm các cặp câu luân phiên với số tiếng lần lượt là bao nhiêu?',
    options: ['Cặp câu 5 tiếng và 7 tiếng', 'Cặp câu 6 tiếng và 8 tiếng', 'Cặp câu 7 tiếng và 8 tiếng', 'Cặp câu 6 tiếng và 7 tiếng'],
    answer: 'B',
    guide: 'Chọn đúng đáp án B: Thể thơ lục bát có một câu 6 tiếng (lục) và một câu 8 tiếng (bát) ghép thành từng cặp.',
    maxScore: 0.5,
    tags: ['Lục bát', 'Thể thơ', 'Nhận biết', 'Lớp 6'],
    createdAt: '2024-11-01T08:00:00Z',
  },
  {
    id: 'q-002',
    grade: '7',
    strand: 'tieng_viet',
    cognitiveLevel: 'thong_hieu',
    questionType: 'tu_luan',
    genre: 'Thơ ca',
    prompt: 'Chỉ ra và nêu tác dụng của biện pháp tu từ so sánh trong hai câu thơ: "Một miếng cau khô / Khô gầy như mẹ".',
    answer: 'Biện pháp tu từ so sánh "khô gầy như mẹ". Tác dụng: khắc họa hình ảnh người mẹ già nua, gầy guộc, vất vả qua năm tháng; đồng thời thể hiện nỗi niềm xót xa, thương cảm sâu sắc của người con khi thấy mẹ ngày một già yếu.',
    guide: 'Nêu đúng biện pháp so sánh: 0.5 điểm. Phân tích tác dụng gợi hình gợi cảm: 0.5 điểm.',
    maxScore: 1.0,
    tags: ['So sánh', 'Biện pháp tu từ', 'Thông hiểu', 'Lớp 7'],
    createdAt: '2024-11-02T08:00:00Z',
  },
  {
    id: 'q-003',
    grade: '8',
    strand: 'viet',
    cognitiveLevel: 'van_dung_cao',
    questionType: 'tu_luan',
    genre: 'Nghị luận xã hội',
    prompt: 'Viết bài văn nghị luận (khoảng 400 - 500 chữ) trình bày suy nghĩ của em về ý nghĩa của sự sẻ chia, giúp đỡ lẫn nhau trong cuộc sống của giới trẻ ngày nay.',
    answer: 'Bài văn cần đảm bảo cấu trúc 3 phần (Mở bài, Thân bài, Kết bài); giải thích được khái niệm "sự sẻ chia"; phân tích ý nghĩa: xoa dịu nỗi đau của người khó khăn, lan tỏa tình yêu thương, giúp bản thân trưởng thành; nêu dẫn chứng xác thực; phê phán thái độ vô cảm; rút ra bài học nhận thức và hành động.',
    guide: 'Cấu trúc bài viết: 0.5đ. Nội dung giải thích và lập luận: 2.5đ. Dẫn chứng xác thực: 0.5đ. Chính tả, diễn đạt, sáng tạo: 0.5đ. Tổng 4.0 điểm.',
    maxScore: 4.0,
    tags: ['Nghị luận xã hội', 'Sẻ chia', 'Vận dụng cao', 'Lớp 8'],
    createdAt: '2024-11-03T08:00:00Z',
  }
];

// Seed sample exam
const SEED_EXAMS: Exam[] = [
  {
    id: 'exam-sample-01',
    code: '101',
    title: 'ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA HỌC KỲ I - MÔN NGỮ VĂN 7',
    school: 'TRƯỜNG THCS NGUYỄN DU',
    district: 'PHÒNG GD&ĐT QUẬN HOÀN KIẾM',
    grade: '7',
    textbook: 'kntt',
    examType: 'giua_ky_1',
    durationMinutes: 90,
    totalScore: 10,
    readingScore: 6.0,
    writingScore: 4.0,
    cognitiveRatios: {
      nhanBiet: 30,
      thongHieu: 35,
      vanDung: 25,
      vanDungCao: 10
    },
    readingPassage: {
      title: 'Mẹ',
      author: 'Đỗ Trung Lai',
      source: 'Tập thơ "Đêm sông Cầu", NXB Quân đội Nhân dân, 2003',
      genre: 'Thơ lục bát',
      content: `Lưng mẹ còng rồi
Cau thì vẫn thẳng
Cau - ngọn xanh rờn
Mẹ - đầu bạc trắng.

Cau ngày càng cao
Mẹ ngày một thấp
Cau gần với giời
Mẹ thì gần đất!

Một miếng cau khô
Khô gầy như mẹ
Con nâng trên tay
Không cầm được lệ.

Ngẩng đầu hỏi giời:
- Sao mẹ ta già?
Không một lời đáp
Mây bay về xa.`,
      isAiSuggested: false,
      isCustom: false,
    },
    readingQuestions: [
      {
        id: 'rq-1',
        number: 1,
        type: 'trac_nghiem',
        cognitiveLevel: 'nhan_biet',
        strand: 'doc_hieu',
        question: 'Bài thơ trên được viết theo thể thơ nào?',
        options: ['Thơ lục bát', 'Thơ bốn chữ', 'Thơ năm chữ', 'Thơ tự do'],
        answer: 'B',
        guide: 'Mỗi dòng thơ có 4 tiếng, gieo vần linh hoạt. Chọn đáp án B: Thơ bốn chữ.',
        score: 0.5,
      },
      {
        id: 'rq-2',
        number: 2,
        type: 'trac_nghiem',
        cognitiveLevel: 'nhan_biet',
        strand: 'doc_hieu',
        question: 'Hình ảnh nào trong bài thơ được tác giả đem ra sóng đôi, đối chiếu với hình ảnh người mẹ?',
        options: ['Cây cau', 'Ngọn mây', 'Chiếc chăn bông', 'Vầng trăng'],
        answer: 'A',
        guide: 'Tác giả đối chiếu hình ảnh cây cau với người mẹ qua các khổ thơ. Chọn A.',
        score: 0.5,
      },
      {
        id: 'rq-3',
        number: 3,
        type: 'trac_nghiem',
        cognitiveLevel: 'thong_hieu',
        strand: 'doc_hieu',
        question: 'Cặp từ trái nghĩa nào sau đây xuất hiện trong khổ thơ thứ nhất và thứ hai?',
        options: ['Còng - thẳng, cao - thấp', 'Giời - đất, xanh - vàng', 'Trắng - đen, già - trẻ', 'Khô - ướt, xa - gần'],
        answer: 'A',
        guide: 'Lưng mẹ còng / Cau thẳng; Cau cao / Mẹ thấp. Chọn A.',
        score: 0.5,
      },
      {
        id: 'rq-4',
        number: 4,
        type: 'trac_nghiem',
        cognitiveLevel: 'thong_hieu',
        strand: 'tieng_viet',
        question: 'Biện pháp tu từ chính được sử dụng trong câu "Khô gầy như mẹ" là gì?',
        options: ['Nhân hóa', 'So sánh', 'Ẩn dụ', 'Điệp ngữ'],
        answer: 'B',
        guide: 'Có từ so sánh "như" liên kết giữa miếng cau khô và mẹ. Chọn B.',
        score: 0.5,
      },
      {
        id: 'rq-5',
        number: 5,
        type: 'tu_luan',
        cognitiveLevel: 'thong_hieu',
        strand: 'doc_hieu',
        question: 'Chỉ ra và phân tích tác dụng của hình ảnh tương phản giữa "cau" và "mẹ" trong hai khổ thơ đầu.',
        answer: 'Tương phản giữa cau (thẳng, xanh rờn, ngày càng cao, gần với giời) và mẹ (còng rồi, đầu bạc trắng, ngày một thấp, gần đất). Tác dụng: làm nổi bật sự tàn phá nghiệt ngã của thời gian đối với tuổi tác và sức khỏe của mẹ, từ đó bộc lộ niềm xót xa, nghẹn ngào của người con.',
        guide: 'Nêu đúng các chi tiết tương phản: 0.5đ. Phân tích tác dụng làm nổi bật hình ảnh người mẹ và cảm xúc người con: 1.0đ. Tổng 1.5đ.',
        score: 1.5,
      },
      {
        id: 'rq-6',
        number: 6,
        type: 'tu_luan',
        cognitiveLevel: 'van_dung',
        strand: 'doc_hieu',
        question: 'Từ tâm trạng của nhân vật người con trong khổ thơ cuối, em rút ra cho bản thân bài học gì về đạo làm con đối với cha mẹ? (Trả lời trong khoảng 4 - 6 dòng).',
        answer: 'Học sinh có thể diễn đạt theo nhiều cách: trân trọng từng phút giây bên cha mẹ khi cha mẹ còn sống; biết yêu thương, chăm sóc, phụng dưỡng, hiếu thảo; cố gắng chăm ngoan, học giỏi để đền đáp công ơn sinh thành dưỡng dục...',
        guide: 'Nêu được bài học sâu sắc, chân thành, hợp chuẩn mực đạo đức: 1.0đ. Viết đúng dung lượng, không sai chính tả: 0.5đ. Tổng 1.5đ.',
        score: 1.5,
      },
      {
        id: 'rq-7',
        number: 7,
        type: 'tu_luan',
        cognitiveLevel: 'van_dung',
        strand: 'tieng_viet',
        question: 'Tìm một phó từ trong bài thơ và nêu ý nghĩa ngữ pháp của phó từ đó.',
        answer: 'Phó từ "đã", "vẫn", "càng", "ngày một"... Ví dụ: Phó từ "vẫn" bổ sung ý nghĩa về sự tiếp diễn của hành động/trạng thái; phó từ "càng" biểu thị mức độ tăng tiến.',
        guide: 'Tìm đúng phó từ: 0.5đ. Nêu đúng ý nghĩa: 0.5đ. Tổng 1.0đ.',
        score: 1.0,
      }
    ],
    writingQuestion: {
      id: 'wq-1',
      topic: 'Viết bài văn biểu cảm (khoảng 400 - 500 chữ) thể hiện cảm nghĩ của em về một người thân yêu nhất trong gia đình (ông, bà, cha hoặc mẹ).',
      cognitiveLevel: 'van_dung_cao',
      requirements: 'Bài viết có bố cục 3 phần rõ ràng, kết hợp nhuần nhuyễn giữa yếu tố miêu tả, tự sự với bộc lộ cảm xúc chân thành, sâu lắng.',
      guide: 'Đảm bảo bố cục bài văn biểu cảm (0.5đ). Xác định đúng đối tượng và tình cảm chủ đạo (0.5đ). Thân bài: kể kết hợp miêu tả làm nổi bật những nét đáng yêu, đáng kính của người thân, xen kẽ dòng cảm xúc biết ơn, gắn bó (2.0đ). Sáng tạo, cảm xúc chân thực, câu văn giàu hình ảnh (0.5đ). Chính tả, ngữ pháp chuẩn (0.5đ).',
      score: 4.0,
      rubricCriteria: [
        { name: 'Hình thức bài văn', description: 'Đủ 3 phần Mở - Thân - Kết, đúng thể loại biểu cảm', score: 0.5 },
        { name: 'Xác định đối tượng', description: 'Chọn người thân cụ thể, xác lập cảm xúc nhất quán', score: 0.5 },
        { name: 'Nội dung biểu cảm', description: 'Kết hợp kể, tả và bộc lộ cảm xúc sâu sắc về người thân', score: 2.0 },
        { name: 'Chính tả, ngữ pháp', description: 'Viết đúng chính tả, dùng từ chính xác, câu văn gãy gọn', score: 0.5 },
        { name: 'Sáng tạo', description: 'Cách diễn đạt truyền cảm, giọng điệu riêng biệt, độc đáo', score: 0.5 },
      ]
    },
    matrix: {
      rows: [
        {
          strand: 'I. Đọc hiểu',
          subStrand: 'Thơ bốn chữ / năm chữ',
          nhanBiet: { tnCount: 2, tlCount: 0, score: 1.0 },
          thongHieu: { tnCount: 1, tlCount: 1, score: 2.0 },
          vanDung: { tnCount: 0, tlCount: 1, score: 1.5 },
          vanDungCao: { tnCount: 0, tlCount: 0, score: 0.0 },
          totalScore: 4.5,
          percentage: 45,
        },
        {
          strand: 'II. Tiếng Việt',
          subStrand: 'Biện pháp tu từ & Phó từ',
          nhanBiet: { tnCount: 0, tlCount: 0, score: 0.0 },
          thongHieu: { tnCount: 1, tlCount: 0, score: 0.5 },
          vanDung: { tnCount: 0, tlCount: 1, score: 1.0 },
          vanDungCao: { tnCount: 0, tlCount: 0, score: 0.0 },
          totalScore: 1.5,
          percentage: 15,
        },
        {
          strand: 'III. Viết',
          subStrand: 'Bài văn biểu cảm về người thân',
          nhanBiet: { tnCount: 0, tlCount: 0, score: 0.0 },
          thongHieu: { tnCount: 0, tlCount: 0, score: 0.0 },
          vanDung: { tnCount: 0, tlCount: 0, score: 0.0 },
          vanDungCao: { tnCount: 0, tlCount: 1, score: 4.0 },
          totalScore: 4.0,
          percentage: 40,
        }
      ],
      totalNhanBietScore: 1.0,
      totalThongHieuScore: 2.5,
      totalVanDungScore: 2.5,
      totalVanDungCaoScore: 4.0,
      totalScore: 10.0,
    },
    specification: {
      items: [
        {
          number: 'Câu 1 (TN)',
          strand: 'Đọc hiểu',
          genre: 'Thơ 4 chữ',
          cognitiveLevel: 'Nhận biết',
          standardRequired: 'Nhận biết được đặc điểm thể thơ bốn chữ qua số tiếng của mỗi dòng thơ.',
          questionType: 'Trắc nghiệm khách quan',
          score: 0.5,
        },
        {
          number: 'Câu 2 (TN)',
          strand: 'Đọc hiểu',
          genre: 'Thơ 4 chữ',
          cognitiveLevel: 'Nhận biết',
          standardRequired: 'Nhận biết được hình ảnh đối chiếu sóng đôi trong thi phẩm.',
          questionType: 'Trắc nghiệm khách quan',
          score: 0.5,
        },
        {
          number: 'Câu 3 (TN)',
          strand: 'Đọc hiểu',
          genre: 'Thơ 4 chữ',
          cognitiveLevel: 'Thông hiểu',
          standardRequired: 'Hiểu được tác dụng của các cặp từ ngữ trái nghĩa thể hiện dụng ý tác giả.',
          questionType: 'Trắc nghiệm khách quan',
          score: 0.5,
        },
        {
          number: 'Câu 4 (TN)',
          strand: 'Tiếng Việt',
          genre: 'Biện pháp tu từ',
          cognitiveLevel: 'Thông hiểu',
          standardRequired: 'Xác định chính xác biện pháp tu từ so sánh trong dòng thơ.',
          questionType: 'Trắc nghiệm khách quan',
          score: 0.5,
        },
        {
          number: 'Câu 5 (TL)',
          strand: 'Đọc hiểu',
          genre: 'Thơ 4 chữ',
          cognitiveLevel: 'Thông hiểu',
          standardRequired: 'Phân tích được ý nghĩa biểu cảm của nghệ thuật tương phản đối lập trong bài thơ.',
          questionType: 'Tự luận ngắn',
          score: 1.5,
        },
        {
          number: 'Câu 6 (TL)',
          strand: 'Đọc hiểu',
          genre: 'Thơ 4 chữ',
          cognitiveLevel: 'Vận dụng',
          standardRequired: 'Rút ra thông điệp, bài học ý nghĩa về đạo hiếu và cách ứng xử đối với cha mẹ.',
          questionType: 'Tự luận',
          score: 1.5,
        },
        {
          number: 'Câu 7 (TL)',
          strand: 'Tiếng Việt',
          genre: 'Ngữ pháp',
          cognitiveLevel: 'Vận dụng',
          standardRequired: 'Nhận diện và nêu ý nghĩa ngữ pháp của phó từ được sử dụng trong văn cảnh.',
          questionType: 'Tự luận ngắn',
          score: 1.0,
        },
        {
          number: 'Phần II (TL)',
          strand: 'Tập làm văn',
          genre: 'Văn biểu cảm',
          cognitiveLevel: 'Vận dụng cao',
          standardRequired: 'Viết được bài văn biểu cảm về người thân, bộc lộ tình cảm chân thành, sâu sắc.',
          questionType: 'Tự luận bài văn',
          score: 4.0,
        }
      ]
    },
    variants: [
      {
        code: '102',
        title: 'ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA HỌC KỲ I - MÔN NGỮ VĂN 7 (MÃ ĐỀ 102)',
        readingQuestions: [
          {
            id: 'rq-102-1',
            number: 1,
            type: 'trac_nghiem',
            cognitiveLevel: 'nhan_biet',
            strand: 'doc_hieu',
            question: 'Hình ảnh nào trong bài thơ được tác giả đem ra đối chiếu xuyên suốt với hình ảnh người mẹ?',
            options: ['Ngọn mây', 'Cây cau', 'Vầng trăng', 'Chiếc chăn bông'],
            answer: 'B',
            guide: 'Đáp án B: Cây cau.',
            score: 0.5,
          },
          {
            id: 'rq-102-2',
            number: 2,
            type: 'trac_nghiem',
            cognitiveLevel: 'nhan_biet',
            strand: 'doc_hieu',
            question: 'Thể thơ của bài thơ "Mẹ" (Đỗ Trung Lai) là gì?',
            options: ['Thơ tự do', 'Thơ lục bát', 'Thơ bốn chữ', 'Thơ năm chữ'],
            answer: 'C',
            guide: 'Đáp án C: Thơ bốn chữ.',
            score: 0.5,
          },
          {
            id: 'rq-102-3',
            number: 3,
            type: 'trac_nghiem',
            cognitiveLevel: 'thong_hieu',
            strand: 'tieng_viet',
            question: 'Biện pháp tu từ nổi bật trong câu "Một miếng cau khô / Khô gầy như mẹ" là:',
            options: ['Ẩn dụ', 'Nhân hóa', 'So sánh', 'Hoán dụ'],
            answer: 'C',
            guide: 'Đáp án C: So sánh.',
            score: 0.5,
          },
          {
            id: 'rq-102-4',
            number: 4,
            type: 'trac_nghiem',
            cognitiveLevel: 'thong_hieu',
            strand: 'doc_hieu',
            question: 'Dòng nào dưới đây nêu đúng nhất cảm xúc chủ đạo của người con trong bài thơ?',
            options: ['Tự hào, kiêu hãnh', 'Xót xa, yêu thương và tha thiết thương mẹ', 'Vui mừng, phấn khởi', 'Bàng quan, lạnh lùng'],
            answer: 'B',
            guide: 'Đáp án B: Nỗi xót xa nghẹn ngào và lòng thương mẹ vô hạn.',
            score: 0.5,
          },
          {
            id: 'rq-102-5',
            number: 5,
            type: 'tu_luan',
            cognitiveLevel: 'thong_hieu',
            strand: 'doc_hieu',
            question: 'Chỉ ra và phân tích tác dụng của hình ảnh tương phản giữa "cau" và "mẹ" trong hai khổ thơ đầu.',
            answer: 'Tương phản giữa cau và mẹ làm nổi bật sự già nua, hao mòn sức khỏe của mẹ theo thời gian, bộc lộ tình thương mẹ vô bờ của người con.',
            guide: 'Nêu đúng chi tiết: 0.5đ. Phân tích tác dụng: 1.0đ. Tổng 1.5đ.',
            score: 1.5,
          },
          {
            id: 'rq-102-6',
            number: 6,
            type: 'tu_luan',
            cognitiveLevel: 'van_dung',
            strand: 'doc_hieu',
            question: 'Từ câu hỏi tu từ "Sao mẹ ta già?" ở cuối bài, em hãy viết một đoạn văn ngắn (khoảng 5 - 7 câu) nêu suy nghĩ về trách nhiệm của con cái đối với cha mẹ khi cha mẹ tuổi đã cao.',
            answer: 'Học sinh nêu rõ: cha mẹ dành cả cuộc đời lo cho con, khi về già sức yếu cần được con cái quan tâm, chăm sóc chu đáo cả vật chất lẫn tinh thần...',
            guide: 'Nội dung sâu sắc, cảm xúc chân thành: 1.0đ. Diễn đạt mạch lạc: 0.5đ. Tổng 1.5đ.',
            score: 1.5,
          },
          {
            id: 'rq-102-7',
            number: 7,
            type: 'tu_luan',
            cognitiveLevel: 'van_dung',
            strand: 'tieng_viet',
            question: 'Tìm một phó từ trong bài thơ và giải thích tác dụng của nó trong câu thơ chứa nó.',
            answer: 'Ví dụ: phó từ "vẫn", "càng", "ngày một"... biểu thị sự vận động, tiếp diễn hoặc mức độ tăng tiến.',
            guide: 'Tìm đúng phó từ: 0.5đ. Giải thích tác dụng: 0.5đ. Tổng 1.0đ.',
            score: 1.0,
          }
        ],
        writingQuestion: {
          id: 'wq-102',
          topic: 'Viết bài văn biểu cảm (khoảng 400 - 500 chữ) thể hiện tình cảm của em đối với người bà kính yêu của mình.',
          cognitiveLevel: 'van_dung_cao',
          requirements: 'Bố cục rõ ràng 3 phần, bộc lộ tình cảm chân thực, giàu cảm xúc, kết hợp tự sự và miêu tả hợp lý.',
          guide: 'Cấu trúc bài văn biểu cảm (0.5đ). Thể hiện tình cảm với bà (0.5đ). Nội dung kể, tả chi tiết gắn với cảm xúc (2.0đ). Sáng tạo, cảm xúc (0.5đ). Chính tả ngữ pháp (0.5đ). Tổng 4.0đ.',
          score: 4.0,
          rubricCriteria: [
            { name: 'Hình thức bài văn', description: 'Đủ 3 phần Mở - Thân - Kết', score: 0.5 },
            { name: 'Xác định đối tượng', description: 'Người bà kính yêu, tình cảm sâu đậm', score: 0.5 },
            { name: 'Nội dung biểu cảm', description: 'Kể tả kết hợp bộc lộ tình cảm chân thành', score: 2.0 },
            { name: 'Chính tả, dùng từ', description: 'Không mắc lỗi chính tả, diễn đạt trôi chảy', score: 0.5 },
            { name: 'Sáng tạo', description: 'Hình ảnh độc đáo, giọng văn giàu cảm xúc', score: 0.5 },
          ]
        }
      }
    ],
    status: 'approved',
    teacherName: 'Nguyễn Thị Thu Hà',
    schoolYear: '2024 - 2025',
    semester: 'Học kỳ I',
    notes: 'Đề thi bám sát Công văn 3175/BGDĐT, sử dụng ngữ liệu thơ 4 chữ ngoài SGK.',
    createdAt: '2024-11-05T08:30:00Z',
    updatedAt: '2024-11-05T10:15:00Z',
  }
];

export const db = {
  getSettings(): AppSettings {
    return readFileSafe<AppSettings>(SETTINGS_FILE, DEFAULT_SETTINGS);
  },
  saveSettings(settings: AppSettings): void {
    writeFileSafe(SETTINGS_FILE, settings);
  },
  
  getMaterials(): MaterialPassage[] {
    const list = readFileSafe<MaterialPassage[]>(MATERIALS_FILE, []);
    if (list.length === 0) {
      writeFileSafe(MATERIALS_FILE, SEED_MATERIALS);
      return SEED_MATERIALS;
    }
    return list;
  },
  saveMaterials(materials: MaterialPassage[]): void {
    writeFileSafe(MATERIALS_FILE, materials);
  },

  getQuestions(): QuestionBankItem[] {
    const list = readFileSafe<QuestionBankItem[]>(QUESTIONS_FILE, []);
    if (list.length === 0) {
      writeFileSafe(QUESTIONS_FILE, SEED_QUESTIONS);
      return SEED_QUESTIONS;
    }
    return list;
  },
  saveQuestions(questions: QuestionBankItem[]): void {
    writeFileSafe(QUESTIONS_FILE, questions);
  },

  getExams(): Exam[] {
    const list = readFileSafe<Exam[]>(EXAMS_FILE, []);
    if (list.length === 0) {
      writeFileSafe(EXAMS_FILE, SEED_EXAMS);
      return SEED_EXAMS;
    }
    return list;
  },
  saveExams(exams: Exam[]): void {
    writeFileSafe(EXAMS_FILE, exams);
  },

  getDocuments(): TeacherDocument[] {
    return readFileSafe<TeacherDocument[]>(DOCUMENTS_FILE, []);
  },
  saveDocuments(docs: TeacherDocument[]): void {
    writeFileSafe(DOCUMENTS_FILE, docs);
  }
};
