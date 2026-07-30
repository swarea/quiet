// Sample data for the mock preview only. No real personal or company data.
// Korean + English, with deliberate edge cases (long titles, missing summaries).

export const site = {
  name: "swarea",
  initial: "s",
  tagline: "기술 · 데이터 · 삶의 기록",
  blogger: "swarea",
  bio: "기술과 데이터를 기록하고, 해외 개발자 취업을 준비합니다.",
  github: "https://github.com/swarea",
  year: 2026,
  counts: { total: "39,179", today: "8", yesterday: "40" },
  categories: [
    { label: "전체 글", count: 512, url: "/", active: true },
    {
      label: "Programming",
      count: 360,
      children: [
        { label: "TypeScript", count: 42, url: "/category/programming/typescript" },
        { label: "JavaScript", count: 55, url: "/category/programming/javascript" },
        { label: "Python", count: 31, url: "/category/programming/python" },
      ],
    },
    { label: "Problem Solving", count: 85, url: "/category/problem-solving" },
    { label: "Data & 분석", count: 44, url: "/category/data" },
    { label: "Career & 해외 취업", count: 26, url: "/category/career" },
    { label: "Daily & 묵상", count: 29, url: "/category/daily" },
  ],
};

const recent = [
  {
    date: "06.28",
    category: "TypeScript",
    categoryUrl: "/category/Programming/TypeScript",
    title: "TypeScript 프로젝트에서 런타임 검증이 필요한 순간들",
    summary:
      "컴파일 타입은 런타임 데이터를 지켜주지 못한다. 경계에서 한 번 검증하면 내부 코드는 타입을 신뢰할 수 있다.",
    url: "/article",
  },
  {
    date: "06.15",
    category: "Career",
    categoryUrl: "/category/Career",
    title: "해외 취업 준비 로그 #3: 영어 이력서를 다시 쓰며 배운 것",
    summary:
      "한국식 이력서와 영문 레주메는 형식이 아니라 화법이 다르다. 성과를 숫자로 말하는 연습, 그리고 동사 선택이 남기는 인상.",
    url: "/article",
  },
  {
    date: "05.30",
    category: "묵상",
    categoryUrl: "/category/Daily/묵상",
    title: "시편 23편: 부족함이 없으리로다",
    summary: "",
    url: "/article",
  },
  {
    date: "05.11",
    category: "Programming",
    categoryUrl: "/category/Programming",
    title:
      "아주 긴 제목이 들어와도 목록이 무너지지 않는지 확인하는 예시: Understanding Long Titles and Overflow Behavior in List Layouts",
    summary: "",
    url: "/article",
  },
];

export const home = {
  headline:
    "배우고 만든 것을, 오래 남기려 기록합니다.<br>기술과 데이터, 그리고 삶과 믿음에 대해.",
  subtitle:
    "Notes on software, data, career abroad, and faith. Written in Korean and English, kept for the long run.",
  featured: {
    category: "회고",
    categoryUrl: "/category/Data/회고",
    title: "재택근무 1년, 데이터로 돌아보기",
    summary:
      "1년치 커밋과 업무 로그를 정리해 보니, 막연히 느끼던 것과 실제 패턴은 꽤 달랐다. 집중 시간대, 회의가 생산성에 남긴 흔적, 그리고 기록이 습관이 되기까지.",
    date: "2026.06.02",
    readtime: "12 min",
    comments: 8,
    url: "/article",
    // Stands in for the thumbnail Tistory attaches to a cover item, so the
    // mock exercises the layout with a picture in it rather than without.
    thumbnail:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 200'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23dfe4ee'/%3E%3Cstop offset='1' stop-color='%23c7cede'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='320' height='200' fill='url(%23g)'/%3E%3C/svg%3E",
  },
  recent,
  topics: [
    {
      title: "기술 & 데이터",
      url: "/category/Engineering/기술 & 데이터",
      items: [
        { title: "런타임 검증이 필요한 순간들", url: "/article", date: "2026.07.30" },
        { title: "상태 관리 라이브러리 다시 보기", url: "/article", date: "2026.07.28" },
        { title: "쿼리 로그로 병목 찾기", url: "/article", date: "2026.07.24" },
      ],
    },
    {
      title: "커리어 & 해외",
      url: "/category/Career/커리어 & 해외",
      items: [
        { title: "영어 이력서를 다시 쓰며", url: "/article", date: "2026.07.19" },
        { title: "기술 면접 영어 표현 노트", url: "/article", date: "2026.07.11" },
        { title: "원격 협업에서 배운 것", url: "/article", date: "2026.07.02" },
      ],
    },
    {
      title: "삶 & 믿음",
      url: "/category/Life/삶 & 믿음",
      items: [
        { title: "시편 23편 묵상", url: "/article", date: "2026.06.25" },
        { title: "일과 소명에 대한 생각", url: "/article", date: "2026.06.14" },
        { title: "한 해를 닫으며", url: "/article", date: "2026.06.03" },
      ],
    },
  ],
};

export const list = {
  title: "Programming",
  count: 360,
  posts: recent.concat(recent).slice(0, 6),
};

export const article = {
  crumb: "TypeScript",
  categoryUrl: "/category/Programming/TypeScript",
  categoryName: "TypeScript",
  title: "TypeScript 프로젝트에서 런타임 검증이 필요한 순간들",
  date: "2026.06.28",
  readtime: "12 min read",
  comments: 4,
  tags: ["typescript", "런타임검증", "zod", "타입안정성"],
  prev: { url: "/article", title: "상태 관리 라이브러리, 다시 보기" },
  next: { url: "/article", title: "쿼리 로그로 병목 지점 찾기" },
  related: [
    { title: "제네릭으로 중복 줄이기", date: "06.10", url: "/article" },
    { title: "타입 좁히기의 실전 패턴", date: "05.22", url: "/article" },
    { title: "tsconfig 엄격 모드 정리", date: "05.03", url: "/article" },
  ],
  commentList: [
    {
      initial: "J",
      name: "지훈",
      date: "2026.06.28 22:14",
      body: "경계에서 검증한다는 원칙, 정확히 필요했던 관점이에요. fetch 래퍼 예시가 특히 도움됐습니다.",
    },
    {
      initial: "s",
      name: "swarea",
      date: "2026.06.28 22:40",
      body: "감사합니다. 래퍼 한 겹이 생각보다 많은 버그를 미리 잡아줍니다.",
      reply: true,
    },
    {
      initial: "M",
      name: "migh",
      date: "2026.06.29 09:02",
      body: "내부 함수 인자까지 검증하다가 오히려 느려졌던 기억이… 표의 기준이 명쾌하네요.",
    },
  ],
  body: `
    <p>TypeScript는 컴파일 시점의 타입만 검증한다. API 응답, 폼 입력, URL 파라미터처럼 <em>런타임에 들어오는 데이터</em>는 타입 시스템의 보호 밖에 있다. 경계에서 한 번 제대로 검증하면, 그 안쪽 코드는 비로소 타입을 신뢰할 수 있게 된다.</p>

    <div class="quiet-callout">
      <div class="head"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>Note</div>
      <p>이 글은 라이브러리 자체보다 <strong>어디에 검증을 두어야 하는가</strong>에 집중한다. 코드는 Zod 기준이지만 개념은 다른 검증 도구에도 그대로 적용된다.</p>
    </div>

    <h2>런타임 검증이 왜 필요한가</h2>
    <p>서버가 항상 계약대로 응답한다는 보장은 없다. 스키마가 바뀌고, 필드가 사라지고, 문자열이 들어와야 할 곳에 <code>null</code>이 온다. 타입 단언(<code>as</code>)은 이 문제를 숨길 뿐 해결하지 못한다.</p>

    <blockquote>경계에서 검증하고, 내부에서는 신뢰한다.</blockquote>

    <h2>스키마를 코드로 선언하기</h2>
    <p>응답 스키마를 선언하면 검증과 타입을 <strong>한 곳에서</strong> 얻는다. 문서와 구현이 어긋나는 고전적인 문제가 구조적으로 사라진다.</p>

    <div class="quiet-code">
      <div class="bar"><span class="lang">typescript</span><button class="copy" type="button" data-copy><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg><span>복사</span></button></div>
<pre><code><span class="t-k">import</span> { z } <span class="t-k">from</span> <span class="t-s">"zod"</span>;

<span class="t-k">const</span> <span class="t-f">User</span> = z.<span class="t-f">object</span>({
  id: z.<span class="t-f">number</span>(),
  name: z.<span class="t-f">string</span>().<span class="t-f">min</span>(<span class="t-n">1</span>),
  email: z.<span class="t-f">string</span>().<span class="t-f">email</span>(),
});
<span class="t-k">type</span> User = z.infer&lt;<span class="t-k">typeof</span> User&gt;; <span class="t-c">// 스키마가 곧 타입</span></code></pre>
    </div>

    <h3>타입 추론과의 결합</h3>
    <p>스키마에서 타입을 추론하므로 별도의 <code>interface</code>를 유지할 필요가 없다. 스키마를 고치면 타입이 따라오고, 컴파일러가 나머지를 잡아준다.</p>

    <h2>도입 기준</h2>
    <p>모든 값을 검증할 필요는 없다. 아래 경계에서 가장 값을 한다.</p>
    <ul>
      <li>외부 API 응답: 통제할 수 없는 계약</li>
      <li>사용자 입력: 폼, 쿼리스트링, 업로드</li>
      <li>저장소 경계: localStorage, 설정 파일</li>
    </ul>

    <div class="quiet-tbl-wrap">
      <table class="quiet-data">
        <thead><tr><th>경계</th><th>검증 위치</th><th class="num">비용</th><th class="num">효용</th></tr></thead>
        <tbody>
          <tr><td>API 응답</td><td>fetch 래퍼</td><td class="num">낮음</td><td class="num">높음</td></tr>
          <tr><td>폼 입력</td><td>submit 핸들러</td><td class="num">낮음</td><td class="num">높음</td></tr>
          <tr><td>내부 함수 인자</td><td>—</td><td class="num">높음</td><td class="num">낮음</td></tr>
        </tbody>
      </table>
    </div>

    <figure class="quiet-fig"><div class="ph">그림 1. 검증 경계 다이어그램</div><figcaption>신뢰 경계는 코드 안이 아니라 시스템의 가장자리에 둔다.</figcaption></figure>

    <h3>에디터가 내보내는 형태</h3>
    <p>아래 블록들은 티스토리 에디터가 실제로 만들어내는 마크업이다. 프레임과 복사 버튼, 가로 스크롤 상자는 런타임에 덧입혀진다. <a href="https://example.com" target="_blank">새 탭으로 열리는 링크</a>도 포함한다.</p>

    <pre data-ke-language="javascript"><code>// 에디터가 만든 코드 블록: 프레임 없이 pre 하나로 나온다
const parsed = User.safeParse(await res.json());
if (!parsed.success) throw new Error("계약이 깨졌습니다: " + parsed.error.message);</code></pre>

    <table>
      <thead><tr><th>필드</th><th>타입</th><th>필수</th><th>비고</th><th>기본값</th><th>도입 버전</th></tr></thead>
      <tbody>
        <tr><td>id</td><td>number</td><td>예</td><td>서버 발급</td><td>—</td><td>0.1.0</td></tr>
        <tr><td>name</td><td>string</td><td>예</td><td>1자 이상</td><td>—</td><td>0.1.0</td></tr>
        <tr><td>email</td><td>string</td><td>아니오</td><td>형식 검증</td><td>null</td><td>0.2.0</td></tr>
      </tbody>
    </table>

    <figure class="imageblock alignCenter">
      <img src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='960' height='540'%3E%3Crect width='960' height='540' fill='%23dfe4e1'/%3E%3Ctext x='480' y='285' font-family='monospace' font-size='28' fill='%236b7078' text-anchor='middle'%3E960 %C3%97 540 sample%3C/text%3E%3C/svg%3E" alt="샘플 이미지">
      <figcaption>에디터가 붙이는 이미지 캡션</figcaption>
    </figure>

    <p>긴 코드 줄이나 URL도 본문 폭을 넘기지 않는다. 예를 들어 <code>https://example.com/api/v2/users?fields=id,name,email&amp;include=profile,settings&amp;sort=-createdAt</code> 같은 경우, 인라인 코드는 줄바꿈되고 코드 블록은 가로 스크롤된다.</p>
  `,
};

export const tags = [
  { name: "typescript", count: 42 },
  { name: "javascript", count: 55 },
  { name: "python", count: 31 },
  { name: "데이터분석", count: 24 },
  { name: "런타임검증", count: 6 },
  { name: "zod", count: 4 },
  { name: "상태관리", count: 9 },
  { name: "해외취업", count: 12 },
  { name: "영어", count: 18 },
  { name: "회고", count: 15 },
  { name: "묵상", count: 11 },
  { name: "일상", count: 8 },
  { name: "problem-solving", count: 85 },
  { name: "알고리즘", count: 40 },
  { name: "커리어", count: 14 },
  { name: "productivity", count: 7 },
];

export const search = { query: "런타임 검증", results: recent.slice(0, 2) };
export const searchEmpty = { query: "존재하지않는검색어", results: [] };

export const aboutPage = {
  title: "소개",
  body: `
    <p>안녕하세요. <strong>swarea</strong>입니다. 기술과 데이터를 기록하고, 해외 개발자 취업을 준비하고 있습니다. 이 블로그는 개발과 데이터, 커리어, 그리고 신앙에 대한 오래된 기록을 남기는 공간입니다.</p>
    <h2>다루는 주제</h2>
    <ul>
      <li>개발과 기술 학습, 개인 프로젝트의 시행착오</li>
      <li>데이터에 기반한 분석과 회고</li>
      <li>해외 취업 준비와 영어 학습</li>
      <li>커리어와 삶, 신앙과 말씀 묵상</li>
    </ul>
    <h2>연락</h2>
    <p>제안이나 문의는 <a href="https://github.com/swarea">GitHub</a>으로 남겨주세요.</p>
  `,
};

const guestbook = [
  {
    initial: "H",
    name: "hyeon",
    date: "2026.06.20 10:11",
    body: "글 잘 읽고 있습니다. 특히 데이터 회고 시리즈가 인상 깊었어요.",
  },
  {
    initial: "s",
    name: "swarea",
    date: "2026.06.20 12:03",
    body: "감사합니다. 앞으로도 꾸준히 남겨보겠습니다.",
    reply: true,
  },
];

export const pages = [
  { name: "index", view: "views/home.njk", title: "Home", data: { home } },
  { name: "list", view: "views/list.njk", title: "Programming", data: { list } },
  { name: "article", view: "views/article.njk", title: article.title, data: { article } },
  { name: "tag", view: "views/tag.njk", title: "태그", data: { tags } },
  { name: "search", view: "views/search.njk", title: "검색", data: { search } },
  { name: "search-empty", view: "views/search.njk", title: "검색", data: { search: searchEmpty } },
  { name: "protected", view: "views/protected.njk", title: "보호된 글", data: {} },
  { name: "guestbook", view: "views/guestbook.njk", title: "방명록", data: { guestbook } },
  { name: "about", view: "views/page.njk", title: "소개", data: { page: aboutPage } },
];
