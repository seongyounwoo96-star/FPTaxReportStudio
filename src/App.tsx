import { useEffect, useMemo, useState } from "react";

type Page = "dashboard" | "customers" | "reports" | "analysis" | "builder" | "preview";
type Customer = { id: number; type: "개인" | "법인"; name: string; company: string; memo: string; created: string };
type Report = { id: number; customerId: number; title: string; status: string; updated: string; category: string };

const initialCustomers: Customer[] = [
  { id: 1, type: "법인", name: "김도윤 대표", company: "한결산업 주식회사", memo: "가업승계 사전 검토", created: "2025. 06. 12" },
  { id: 2, type: "개인", name: "박서연", company: "세림테크", memo: "주식 증여 상담", created: "2025. 06. 04" },
  { id: 3, type: "법인", name: "이준호 대표", company: "아크웍스", memo: "정기 재무 컨설팅", created: "2025. 05. 28" },
];

const initialReports: Report[] = [
  { id: 101, customerId: 1, title: "2025 비상장주식 가치평가 보고서", status: "검토 대기", updated: "오늘 10:42", category: "비상장주식 평가" },
  { id: 102, customerId: 2, title: "주식 증여 사전검토", status: "작성 중", updated: "어제 16:18", category: "주식 증여" },
  { id: 103, customerId: 3, title: "법인 재무현황 진단", status: "검토 완료", updated: "6월 15일", category: "기타 컨설팅" },
];

const nav = [
  ["dashboard", "▦", "대시보드"],
  ["customers", "○", "고객 관리"],
  ["reports", "□", "보고서 관리"],
  ["analysis", "◇", "세무 분석 도구"],
  ["builder", "▤", "보고서 템플릿"],
  ["library", "≡", "콘텐츠 라이브러리"],
  ["settings", "⚙", "설정"],
];

const slides = [
  { type: "표지", title: "비상장주식 가치평가 및 증여 검토", kicker: "TAX & FINANCIAL CONSULTING" },
  { type: "고객 현황", title: "고객 및 법인 현황", kicker: "CLIENT OVERVIEW" },
  { type: "분석 개요", title: "평가 범위와 주요 가정", kicker: "VALUATION OVERVIEW" },
  { type: "평가 결과", title: "비상장주식 평가 결과", kicker: "VALUATION RESULT" },
  { type: "검토 사항", title: "주요 검토 사항 및 제안", kicker: "REVIEW & NEXT STEPS" },
];

function Button({ children, variant = "primary", onClick, disabled = false, type = "button" }: any) {
  return <button type={type} className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Input({ label, value, onChange, placeholder, type = "text", error, required = false }: any) {
  return <label className="field"><span>{label}{required && <b> *</b>}</span><input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />{error && <small className="error">{error}</small>}</label>;
}

function Select({ label, value, onChange, children }: any) {
  return <label className="field"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select></label>;
}

function Status({ children }: any) {
  return <span className={`status status-${children.replace(" ", "")}`}>{children}</span>;
}

function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [customers, setCustomers] = useState<Customer[]>(() => JSON.parse(localStorage.getItem("fp-customers") || "null") || initialCustomers);
  const [reports, setReports] = useState<Report[]>(() => JSON.parse(localStorage.getItem("fp-reports") || "null") || initialReports);
  const [showCustomer, setShowCustomer] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState("저장됨");
  const [selectedCustomer, setSelectedCustomer] = useState(1);

  useEffect(() => { localStorage.setItem("fp-customers", JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem("fp-reports", JSON.stringify(reports)); }, [reports]);

  const go = (next: string) => {
    if (next === "library" || next === "settings") return;
    setPage(next as Page);
  };

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">FP</span><div><strong>Tax Report</strong><small>STUDIO</small></div></div>
      <nav>{nav.map(([id, icon, label]) => <button key={id} className={page === id ? "active" : ""} onClick={() => go(id)} title={(id === "library" || id === "settings") ? "다음 버전에서 제공됩니다" : ""}><span>{icon}</span>{label}{(id === "library" || id === "settings") && <i>준비 중</i>}</button>)}</nav>
      <div className="side-bottom"><div className="profile">FP</div><div><strong>재무설계 전문가</strong><small>개인 워크스페이스</small></div></div>
    </aside>
    <main>
      <header>
        <div className="mobile-brand">FP Studio</div>
        <div className="breadcrumb">FP Tax Report Studio <span>/</span> {pageName(page)}</div>
        <div className="header-actions">
          <label className="search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="고객 및 보고서 검색" /></label>
          <span className="saved"><i />{saved}</span>
          <Button onClick={() => setWizard(true)}>＋ 새 보고서</Button>
        </div>
      </header>
      <div className="content">
        {page === "dashboard" && <Dashboard customers={customers} reports={reports} go={go} create={() => setWizard(true)} />}
        {page === "customers" && <Customers customers={customers} search={search} setShow={setShowCustomer} createReport={(id: number) => { setSelectedCustomer(id); setWizard(true); }} />}
        {page === "reports" && <Reports reports={reports} customers={customers} open={(id: number) => { setSelectedCustomer(reports.find(r => r.id === id)?.customerId || 1); setPage("builder"); }} />}
        {page === "analysis" && <Analysis customers={customers} selectedCustomer={selectedCustomer} onSaved={() => { setSaved("방금 저장됨"); setPage("builder"); }} />}
        {page === "builder" && <Builder customers={customers} selectedCustomer={selectedCustomer} preview={() => setPage("preview")} />}
        {page === "preview" && <Preview customers={customers} selectedCustomer={selectedCustomer} back={() => setPage("builder")} />}
      </div>
    </main>
    {showCustomer && <CustomerModal close={() => setShowCustomer(false)} save={(customer: Customer) => { setCustomers([customer, ...customers]); setShowCustomer(false); setSaved("방금 저장됨"); }} />}
    {wizard && <ReportWizard customers={customers} selected={selectedCustomer} close={() => setWizard(false)} next={(customerId: number, title: string) => { const r = { id: Date.now(), customerId, title, status: "작성 중", updated: "방금 전", category: "비상장주식 평가" }; setReports([r, ...reports]); setSelectedCustomer(customerId); setWizard(false); setPage("analysis"); }} />}
  </div>;
}

function pageName(page: Page) {
  return ({ dashboard: "대시보드", customers: "고객 관리", reports: "보고서 관리", analysis: "비상장주식 평가", builder: "보고서 빌더", preview: "보고서 미리보기" })[page];
}

function Dashboard({ customers, reports, go, create }: any) {
  return <><section className="page-head"><div><p className="eyebrow">WORKSPACE OVERVIEW</p><h1>세무 컨설팅 대시보드</h1><p>고객별 분석과 보고서를 한 곳에서 관리하세요.</p></div><Button onClick={create}>＋ 새 보고서 만들기</Button></section>
    <div className="sample-note"><span>i</span> 현재 화면에는 시작을 돕기 위한 샘플 데이터가 포함되어 있습니다. 새 데이터는 이 브라우저에 저장됩니다.</div>
    <section className="stats">
      {[["등록 고객", customers.length, "이번 달 +2"], ["작성 중인 보고서", reports.filter((r: Report) => r.status === "작성 중").length, "계속 작업하기"], ["검토 대기", reports.filter((r: Report) => r.status === "검토 대기").length, "검토 필요"], ["최근 생성", reports.length, "최근 30일"]].map((s, i) => <div className="stat" key={s[0]}><div className={`stat-icon si-${i}`}>{["○", "□", "✓", "↗"][i]}</div><div><span>{s[0]}</span><strong>{s[1]}</strong><small>{s[2]}</small></div></div>)}
    </section>
    <div className="dashboard-grid">
      <section className="panel reports-panel"><PanelHead title="최근 작업한 보고서" action="전체 보기" onClick={() => go("reports")} /><ReportTable reports={reports} customers={customers} onOpen={() => go("builder")} /></section>
      <section className="panel"><PanelHead title="최근 등록 고객" action="고객 관리" onClick={() => go("customers")} /><div className="people">{customers.slice(0, 3).map((c: Customer) => <div key={c.id}><span>{c.name.slice(0, 1)}</span><div><strong>{c.name}</strong><small>{c.company}</small></div><time>{c.created.slice(0, 7)}</time></div>)}</div></section>
      <section className="panel tools"><PanelHead title="자주 사용하는 분석 도구" action="도구 보기" onClick={() => go("analysis")} /><button onClick={() => go("analysis")}><span>₩</span><div><strong>비상장주식 평가</strong><small>주당 평가액 및 증여가액 검토</small></div><b>열기 →</b></button><button disabled><span>％</span><div><strong>상속·증여세</strong><small>다음 버전에서 제공 예정</small></div><em>준비 중</em></button></section>
      <section className="panel template-card"><PanelHead title="최근 사용 템플릿" /><div className="mini-slide"><small>TAX CONSULTING REPORT</small><strong>비상장주식<br />가치평가 보고서</strong><i /></div><div><strong>표준 가치평가 보고서</strong><small>4:3 · 9개 슬라이드 · 최근 사용</small></div></section>
    </div></>;
}

function PanelHead({ title, action, onClick }: any) {
  return <div className="panel-head"><h2>{title}</h2>{action && <button onClick={onClick}>{action} →</button>}</div>;
}

function ReportTable({ reports, customers, onOpen }: any) {
  return <div className="table-wrap"><table><thead><tr><th>보고서</th><th>고객</th><th>분석 유형</th><th>수정일</th><th>상태</th><th /></tr></thead><tbody>{reports.map((r: Report) => <tr key={r.id}><td><button className="table-link" onClick={() => onOpen(r.id)}>{r.title}</button></td><td>{customers.find((c: Customer) => c.id === r.customerId)?.name}</td><td>{r.category}</td><td>{r.updated}</td><td><Status>{r.status}</Status></td><td><button className="more" aria-label="더 보기">···</button></td></tr>)}</tbody></table></div>;
}

function Customers({ customers, search, setShow, createReport }: any) {
  const [filter, setFilter] = useState("전체");
  const list = customers.filter((c: Customer) => (filter === "전체" || c.type === filter) && (`${c.name}${c.company}`.includes(search)));
  return <><section className="page-head"><div><p className="eyebrow">CLIENT DIRECTORY</p><h1>고객 관리</h1><p>고객 정보와 연결된 보고서 이력을 관리합니다.</p></div><Button onClick={() => setShow(true)}>＋ 고객 등록</Button></section>
    <div className="toolbar"><div className="tabs">{["전체", "개인", "법인"].map(x => <button className={filter === x ? "active" : ""} onClick={() => setFilter(x)} key={x}>{x}</button>)}</div><span>총 {list.length}명의 고객</span></div>
    <section className="panel"><div className="table-wrap"><table><thead><tr><th>고객명</th><th>유형</th><th>회사명</th><th>최근 보고서</th><th>등록일</th><th>작업</th></tr></thead><tbody>{list.map((c: Customer) => <tr key={c.id}><td><div className="customer-cell"><span>{c.name[0]}</span><strong>{c.name}</strong></div></td><td>{c.type}</td><td>{c.company || "—"}</td><td>2025. 06. 18</td><td>{c.created}</td><td><Button variant="ghost" onClick={() => createReport(c.id)}>새 보고서</Button></td></tr>)}</tbody></table>{!list.length && <div className="empty"><strong>검색 결과가 없습니다</strong><span>다른 검색어나 필터를 사용해 보세요.</span></div>}</div></section></>;
}

function Reports({ reports, customers, open }: any) {
  const [status, setStatus] = useState("전체");
  const list = reports.filter((r: Report) => status === "전체" || r.status === status);
  return <><section className="page-head"><div><p className="eyebrow">REPORT ARCHIVE</p><h1>보고서 관리</h1><p>작성본과 저장된 버전을 안전하게 구분하여 관리합니다.</p></div></section>
    <div className="toolbar"><div className="tabs">{["전체", "작성 중", "검토 대기", "검토 완료"].map(x => <button className={status === x ? "active" : ""} onClick={() => setStatus(x)} key={x}>{x}</button>)}</div></div>
    <section className="panel"><ReportTable reports={list} customers={customers} onOpen={open} /></section></>;
}

function CustomerModal({ close, save }: any) {
  const [type, setType] = useState("법인"); const [name, setName] = useState(""); const [company, setCompany] = useState(""); const [memo, setMemo] = useState(""); const [error, setError] = useState("");
  return <div className="modal-backdrop" onMouseDown={close}><div className="modal" onMouseDown={e => e.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">NEW CLIENT</p><h2>고객 등록</h2></div><button onClick={close}>×</button></div><div className="form-grid"><Select label="고객 유형" value={type} onChange={setType}><option>법인</option><option>개인</option></Select><Input label="고객 표시명" value={name} onChange={(v: string) => { setName(v); setError(""); }} placeholder="예: 김도윤 대표" required error={error} /><Input label="회사명" value={company} onChange={setCompany} placeholder="회사명을 입력하세요" /><label className="field full"><span>메모</span><textarea value={memo} onChange={e => setMemo(e.target.value)} placeholder="상담 목적이나 참고 사항을 입력하세요" /></label></div><div className="modal-actions"><Button variant="secondary" onClick={close}>취소</Button><Button onClick={() => { if (!name.trim()) return setError("고객 표시명을 입력해 주세요."); save({ id: Date.now(), type, name, company, memo, created: new Date().toLocaleDateString("ko-KR") }); }}>고객 저장</Button></div></div></div>;
}

function ReportWizard({ customers, selected, close, next }: any) {
  const [step, setStep] = useState(1); const [customerId, setCustomerId] = useState(selected); const [title, setTitle] = useState("2025 비상장주식 가치평가 보고서");
  return <div className="modal-backdrop"><div className="modal wizard"><div className="modal-head"><div><p className="eyebrow">NEW REPORT</p><h2>새 보고서 만들기</h2></div><button onClick={close}>×</button></div><div className="steps">{["고객 선택", "기본 정보", "분석 선택"].map((x, i) => <div className={step >= i + 1 ? "active" : ""} key={x}><span>{i + 1}</span>{x}</div>)}</div>
    <div className="wizard-body">{step === 1 && <><h3>어떤 고객의 보고서를 만들까요?</h3><div className="select-cards">{customers.map((c: Customer) => <button className={customerId === c.id ? "selected" : ""} onClick={() => setCustomerId(c.id)} key={c.id}><span>{c.name[0]}</span><div><strong>{c.name}</strong><small>{c.company}</small></div><b>✓</b></button>)}</div></>}
    {step === 2 && <div className="form-grid"><Input label="보고서 제목" value={title} onChange={setTitle} required /><Input label="작성일" value="2025-06-20" onChange={() => {}} type="date" /><Input label="분석 기준일" value="2025-06-20" onChange={() => {}} type="date" /><Select label="보고서 템플릿" value="표준 4:3" onChange={() => {}}><option>표준 가치평가 보고서 (4:3)</option></Select></div>}
    {step === 3 && <><h3>분석 카테고리를 선택하세요</h3><div className="category-grid">{["비상장주식 평가 및 주식 증여", "상속·증여세", "법인 대표 퇴직금", "보험 활용 전략", "부동산 양도소득세", "법인 잉여금·자사주"].map((x, i) => <button key={x} disabled={i > 0} className={i === 0 ? "selected" : ""}><span>{i === 0 ? "₩" : "＋"}</span><strong>{x}</strong><small>{i === 0 ? "평가 입력과 데모 분석 사용 가능" : "준비 중 — 계산 기능 미제공"}</small></button>)}</div></>}</div>
    <div className="modal-actions"><Button variant="secondary" onClick={() => step === 1 ? close() : setStep(step - 1)}>{step === 1 ? "취소" : "이전"}</Button><Button onClick={() => step < 3 ? setStep(step + 1) : next(customerId, title)}>{step < 3 ? "다음" : "분석 시작"}</Button></div></div></div>;
}

function Analysis({ customers, selectedCustomer, onSaved }: any) {
  const customer = customers.find((c: Customer) => c.id === selectedCustomer) || customers[0];
  const [form, setForm] = useState({ company: customer.company, date: "2025-06-20", purpose: "주식 증여 사전 검토", shares: "100,000", target: "10,000", treasury: "0", assets: "4,850,000,000", debt: "1,920,000,000", income: "740,000,000" });
  const [errors, setErrors] = useState<any>({}); const [run, setRun] = useState(false);
  const set = (key: string, value: string) => setForm({ ...form, [key]: value.replace(/[^\d]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") });
  const validate = () => { const e: any = {}; if (!form.company) e.company = "법인명을 입력해 주세요."; if (!form.shares || form.shares === "0") e.shares = "발행주식 수를 확인해 주세요."; if (!form.assets) e.assets = "자산총액이 필요합니다."; setErrors(e); if (!Object.keys(e).length) setRun(true); };
  const equity = Number(form.assets.replaceAll(",", "")) - Number(form.debt.replaceAll(",", ""));
  return <><section className="page-head compact"><div><p className="eyebrow">ANALYSIS TOOL · DEMO MODE</p><h1>비상장주식 평가</h1><p>{customer.name} · 입력값을 바탕으로 보고서용 분석 초안을 만듭니다.</p></div><Status>{run ? "검토 대기" : "작성 중"}</Status></section>
    <div className="demo-warning"><strong>데모 계산</strong> 아래 결과는 검증된 세무 평가액이 아닙니다. 실제 의사결정 전 세무 전문가의 검토가 필요합니다.</div>
    <div className="analysis-layout"><div className="analysis-form">
      <FormSection num="01" title="평가 기본 정보"><div className="form-grid"><Input label="평가 기준일" type="date" value={form.date} onChange={(v: string) => setForm({ ...form, date: v })} /><Input label="법인명" value={form.company} onChange={(v: string) => setForm({ ...form, company: v })} error={errors.company} required /><Input label="평가 목적" value={form.purpose} onChange={(v: string) => setForm({ ...form, purpose: v })} /><Select label="법인 유형" value="일반법인" onChange={() => {}}><option>일반법인</option><option>중소기업</option></Select></div></FormSection>
      <FormSection num="02" title="주식 정보"><div className="form-grid three"><Input label="발행주식 총수" value={form.shares} onChange={(v: string) => set("shares", v)} error={errors.shares} /><Input label="평가 대상 주식 수" value={form.target} onChange={(v: string) => set("target", v)} /><Input label="자기주식 수" value={form.treasury} onChange={(v: string) => set("treasury", v)} /></div></FormSection>
      <FormSection num="03" title="최근 사업연도 재무 정보"><div className="form-grid three"><Input label="자산총액 (원)" value={form.assets} onChange={(v: string) => set("assets", v)} error={errors.assets} /><Input label="부채총액 (원)" value={form.debt} onChange={(v: string) => set("debt", v)} /><Input label="최근 순손익 (원)" value={form.income} onChange={(v: string) => set("income", v)} /></div><p className="source-note">자료 기준: 2024년 결산 재무제표 · 출처는 분석 저장 전 확인해 주세요.</p></FormSection>
    </div><aside className="result-panel"><p className="eyebrow">VALUATION SUMMARY</p><h2>평가 요약</h2><div className="progress"><span><i style={{ width: run ? "82%" : "36%" }} /></span><small>{run ? "입력 검증 완료 · 전문가 검토 필요" : "필수 정보를 입력해 주세요"}</small></div><dl><div><dt>적용 평가방법</dt><dd>순자산가치 기반 데모</dd></div><div className="key-result"><dt>주당 참고값</dt><dd>{run ? `${Math.max(0, Math.round(equity / Number(form.shares.replaceAll(",", "")))).toLocaleString()}원` : "—"}</dd><small>실제 세무 평가액 아님</small></div><div><dt>평가 대상 참고총액</dt><dd>{run ? `${Math.max(0, Math.round(equity / Number(form.shares.replaceAll(",", "")) * Number(form.target.replaceAll(",", "")))).toLocaleString()}원` : "—"}</dd></div></dl><div className="review-list"><strong>추가 검토 사항</strong><p>• 최근 3개년 순손익 자료</p><p>• 비사업용 자산 및 최대주주 할증 여부</p><p>• 발행주식 및 자기주식 증빙</p></div><div className="result-actions"><Button variant="secondary" onClick={validate}>입력값 검증</Button><Button onClick={validate}>분석 실행</Button><Button variant="dark" disabled={!run} onClick={onSaved}>결과 저장 후 보고서에 추가</Button></div></aside></div></>;
}

function FormSection({ num, title, children }: any) { return <section className="form-section"><div className="section-title"><span>{num}</span><h2>{title}</h2></div>{children}</section>; }

function Builder({ customers, selectedCustomer, preview }: any) {
  const [selected, setSelected] = useState(3); const [slideList, setSlideList] = useState(slides); const customer = customers.find((c: Customer) => c.id === selectedCustomer) || customers[0]; const slide = slideList[selected];
  const move = (dir: number) => { const to = selected + dir; if (to < 0 || to >= slideList.length) return; const next = [...slideList]; [next[selected], next[to]] = [next[to], next[selected]]; setSlideList(next); setSelected(to); };
  return <div className="builder-shell"><div className="builder-top"><div><button className="back-link" onClick={() => history.back()}>←</button><div><strong>2025 비상장주식 가치평가 보고서</strong><small>{customer.name} · 현재 수정본 · 로컬 저장</small></div></div><div><Button variant="secondary" onClick={preview}>미리보기</Button><Button onClick={() => localStorage.setItem("fp-slide-order", JSON.stringify(slideList))}>저장</Button></div></div>
    <div className="builder-layout"><aside className="slide-rail"><div className="rail-head"><strong>슬라이드</strong><span>{slideList.length}장</span></div>{slideList.map((s, i) => <button className={selected === i ? "active" : ""} onClick={() => setSelected(i)} key={s.title}><span>{i + 1}</span><div className="thumb"><small>{s.kicker}</small><b>{s.title}</b><i /></div></button>)}<Button variant="ghost" onClick={() => setSlideList([...slideList, { type: "새 슬라이드", title: "새 분석 페이지", kicker: "TAX CONSULTING" }])}>＋ 슬라이드 추가</Button></aside>
    <section className="canvas-area"><div className="canvas-toolbar"><span>표준 4:3 · 10 × 7.5 in</span><div><button onClick={() => move(-1)}>↑ 위로</button><button onClick={() => move(1)}>↓ 아래로</button></div></div><ReportCanvas slide={slide} customer={customer} page={selected + 1} /></section>
    <aside className="edit-panel"><p className="eyebrow">SLIDE EDITOR</p><h2>{slide.type}</h2><Input label="슬라이드 제목" value={slide.title} onChange={(v: string) => { const next = [...slideList]; next[selected] = { ...slide, title: v }; setSlideList(next); }} /><label className="field"><span>핵심 설명</span><textarea defaultValue="입력된 재무자료를 바탕으로 주요 결과와 검토 항목을 정리했습니다." /></label><label className="field"><span>출처 및 주석</span><textarea defaultValue="자료: 고객 제공 재무제표 / 본 결과는 데모 참고값이며 세무 검토가 필요합니다." /></label><div className="ai-off"><strong>AI 콘텐츠 생성</strong><small>API가 연결되지 않아 현재 사용할 수 없습니다.</small><Button variant="secondary" disabled>연결 후 사용</Button></div></aside></div></div>;
}

function ReportCanvas({ slide, customer, page }: any) {
  return <div className={`report-canvas ${page === 1 ? "cover" : ""}`}><div className="canvas-header"><span>FP TAX REPORT STUDIO</span><small>CONFIDENTIAL</small></div><div className="canvas-body">{page === 1 ? <><p>{slide.kicker}</p><h2>{slide.title}</h2><div className="cover-line" /><dl><div><dt>고객</dt><dd>{customer.name}</dd></div><div><dt>법인</dt><dd>{customer.company}</dd></div><div><dt>분석 기준일</dt><dd>2025. 06. 20</dd></div></dl></> : <><p>{slide.kicker}</p><h2>{slide.title}</h2>{page === 4 ? <div className="result-content"><div><small>주당 참고 평가액</small><strong>29,300원</strong><span>데모 참고값 · 실제 세무 평가액 아님</span></div><div><small>평가 대상 주식</small><strong>10,000주</strong><span>전체 발행주식의 10.0%</span></div><div><small>평가 대상 참고총액</small><strong>293,000,000원</strong><span>전문가 검토 전 초안</span></div></div> : <div className="generic-content"><div><strong>분석 기준</strong><p>최근 결산 재무자료 및 고객 제공 정보를 기준으로 검토했습니다.</p></div><div><strong>핵심 관찰</strong><p>주식 가치와 증여 실행 시점에 영향을 주는 주요 항목을 확인합니다.</p></div><div><strong>후속 검토</strong><p>세법상 평가방법 적용 여부와 추가 증빙자료 확인이 필요합니다.</p></div></div>}</>}</div><div className="canvas-footer"><span>{customer.name} · 비상장주식 가치평가 보고서</span><span>{String(page).padStart(2, "0")}</span></div></div>;
}

function Preview({ customers, selectedCustomer, back }: any) {
  const [page, setPage] = useState(1); const customer = customers.find((c: Customer) => c.id === selectedCustomer) || customers[0];
  return <div className="preview-page"><div className="preview-head"><div><Button variant="secondary" onClick={back}>← 편집으로</Button><div><strong>보고서 미리보기</strong><small>표준 4:3 · 저장된 출력 스타일 확인</small></div></div><div><Button variant="secondary" disabled>PDF 내보내기 · 미연결</Button><Button variant="secondary" disabled>PPTX 내보내기 · 미연결</Button></div></div><div className="preview-stage"><div className="preview-thumbs">{slides.map((s, i) => <button className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)} key={s.title}><span>{i + 1}</span><div><small>{s.kicker}</small><b>{s.title}</b></div></button>)}</div><div className="preview-center"><ReportCanvas slide={slides[page - 1]} customer={customer} page={page} /><div className="pager"><button disabled={page === 1} onClick={() => setPage(page - 1)}>← 이전</button><span>{page} / {slides.length}</span><button disabled={page === slides.length} onClick={() => setPage(page + 1)}>다음 →</button></div></div></div></div>;
}

export default App;
