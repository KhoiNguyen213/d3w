import { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

console.log("API:", API_URL);

// ============================================================================
// HỆ THỐNG DỮ LIỆU TĨNH: TRÍCH DẪN & GỢI Ý CÂU HỎI
// ============================================================================

const COMFORT_QUOTES = [
  {
    text: "Gia đình không phải là việc chúng ta có hoàn hảo hay không, mà là việc chúng ta có sẵn lòng lắng nghe nhau hay không.",
    author: "Thiền sư Thích Nhất Hạnh",
  },
  {
    text: "Lắng nghe không phán xét là món quà chữa lành lớn nhất mà cha mẹ có thể dành cho con cái.",
    author: "Tiến sĩ Tâm lý học Gia đình",
  },
  {
    text: "Con cái đôi khi chỉ cần một người lắng nghe, chứ không phải một người phán xét hay đổ lỗi.",
    author: "Thông điệp từ Hiểu Nhau",
  },
  {
    text: "Yêu thương thực sự bắt đầu khi ta đặt cái tôi của mình xuống và cố gắng nhìn cuộc đời bằng đôi mắt của người kia.",
    author: "Khuyết danh",
  },
  {
    text: "Khoảng cách lớn nhất giữa cha mẹ và con cái không phải là tuổi tác, mà là sự im lặng. Hãy bắt đầu chia sẻ từ hôm nay.",
    author: "Nhịp cầu Gia đình",
  },
  {
    text: "Mỗi nỗ lực lắng nghe của bạn hôm nay là một viên gạch xây nên ngôi nhà hạnh phúc ngày mai.",
    author: "Lời nhắn ấm áp",
  },
];

const PRESET_AI_QUESTIONS = [
  "Bạn/Con cảm thấy thế nào về kỳ vọng điểm số và học tập trong gia đình?",
  "Cách tốt nhất để hai bên thể hiện tình cảm và sự quan tâm với nhau là gì?",
  "Điều gì khiến bạn/con cảm thấy khó chia sẻ nhất với người kia?",
  "Bạn/Con muốn người kia thay đổi thói quen nào nhất khi cả hai tranh luận?",
  "Hai bên mong muốn dành thời gian rảnh cuối tuần cùng nhau như thế nào?",
];

const MASCOTS = [
  "🦊",
  "🐰",
  "🐨",
  "🐼",
  "🐻",
  "🦁",
  "🐯",
  "🐶",
  "🐱",
  "🐥",
  "🦉",
  "🦄",
];
const MASCOT_NAMES = [
  "Cáo Nhỏ",
  "Thỏ Bông",
  "Koala Hiền",
  "Gấu Trúc",
  "Gấu Nâu",
  "Sư Tử Con",
  "Hổ Nhỏ",
  "Cún Con",
  "Mèo Ấm",
  "Chíp Chíp",
  "Cú Trí Tuệ",
  "Kỳ Lân",
];

const getAvatarByEmail = (email) => {
  if (!email) return { mascot: "🦊", name: "Khách", color: "#E07A5F" };
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash += email.charCodeAt(i);
  }
  const index = hash % MASCOTS.length;
  const colors = [
    "#E07A5F",
    "#3D5A80",
    "#81B29A",
    "#F28482",
    "#F4A261",
    "#E76F51",
    "#2A9D8F",
    "#457B9D",
  ];
  return {
    mascot: MASCOTS[index],
    name: MASCOT_NAMES[index],
    color: colors[hash % colors.length],
  };
};

// ============================================================================
// TRÌNH TƯ VẤN AI GIẢ LẬP TÂM LÝ HỌC (EMPATHETIC AI RECOMMENDATION ENGINE)
// ============================================================================

const generateSimulatedAIAdvice = (
  question,
  parentAns,
  parentEmo,
  childAns,
  childEmo,
) => {
  const pEmoVi =
    {
      happy: "Vui vẻ",
      anxious: "Lo âu",
      hopeful: "Hy vọng",
      stressed: "Áp lực",
    }[parentEmo] || "Bình thường";
  const cEmoVi =
    {
      happy: "Vui vẻ",
      anxious: "Lo âu",
      hopeful: "Hy vọng",
      stressed: "Áp lực",
    }[childEmo] || "Bình thường";

  // Phân tích từ khóa để tăng tính cá nhân hóa
  const lowercaseP = parentAns.toLowerCase();
  const lowercaseC = childAns.toLowerCase();

  let focusPoints = [];
  if (
    lowercaseP.includes("học") ||
    lowercaseC.includes("học") ||
    lowercaseP.includes("điểm") ||
    lowercaseC.includes("điểm")
  ) {
    focusPoints.push("áp lực học tập và kỳ vọng điểm số");
  }
  if (
    lowercaseP.includes("điện thoại") ||
    lowercaseC.includes("điện thoại") ||
    lowercaseP.includes("game") ||
    lowercaseC.includes("game")
  ) {
    focusPoints.push("việc cân bằng thời gian sử dụng thiết bị công nghệ");
  }
  if (
    lowercaseP.includes("nghe") ||
    lowercaseC.includes("nghe") ||
    lowercaseP.includes("nói") ||
    lowercaseC.includes("nói")
  ) {
    focusPoints.push("cách thức lắng nghe chủ động và đối thoại ôn hòa");
  }

  const topicName =
    focusPoints.length > 0
      ? focusPoints.join(" cũng như ")
      : "sự khác biệt trong thói quen và suy nghĩ hàng ngày";

  let adviceHTML = `
    <p style="margin-bottom: 12px;"><strong>💡 Nhận định từ AI:</strong> Hai bên đang thảo luận về <em>${topicName}</em>. AI nhận thấy cha mẹ chia sẻ với trạng thái cảm xúc <strong>${pEmoVi}</strong>, trong khi con cái đang cảm thấy <strong>${cEmoVi}</strong>.</p>
    
    <div style="margin-bottom: 14px; padding-left: 12px; border-left: 3px solid var(--secondary);">
      <span style="font-weight: 600; font-size: 13px; color: var(--secondary); display: block; text-transform: uppercase;">Góc nhìn của Cha mẹ:</span>
      <p style="font-size: 14px; font-style: italic;">"Cha mẹ mong muốn điều tốt nhất, có xu hướng lo toan và muốn bảo bọc, hướng dẫn con tránh vấp ngã. Sự ${pEmoVi === "Lo âu" || pEmoVi === "Áp lực" ? "lo lắng/áp lực" : "quan tâm"} này xuất phát từ tình yêu thương chân thành nhưng đôi khi cách thể hiện còn mang tính áp đặt."</p>
    </div>

    <div style="margin-bottom: 14px; padding-left: 12px; border-left: 3px solid var(--primary);">
      <span style="font-weight: 600; font-size: 13px; color: var(--primary); display: block; text-transform: uppercase;">Góc nhìn của Con cái:</span>
      <p style="font-size: 14px; font-style: italic;">"Con cái đang lớn, mong muốn được tôn trọng sự tự lập và có không gian riêng để khám phá. Cảm giác ${cEmoVi === "Áp lực" || cEmoVi === "Lo âu" ? "áp lực/lo âu" : "hy vọng"} cho thấy con rất quan tâm đến suy nghĩ của cha mẹ, nhưng cần được thấu cảm trước khi nhận lời khuyên."</p>
    </div>

    <div style="background-color: var(--accent-light); padding: 12px; border-radius: 12px; margin-top: 10px;">
      <span style="font-weight: 700; color: var(--accent); display: block; font-size: 14px; margin-bottom: 6px;">🌱 Cùng Thay Đổi Để Gần Nhau Hơn:</span>
      <ul style="padding-left: 18px; margin: 0; font-size: 13.5px; display: flex; flex-direction: column; gap: 4px;">
        <li><strong>Dành cho Cha mẹ:</strong> Thay vì đưa ra giải pháp ngay, hãy thử hỏi: <em>"Bố/mẹ có thể lắng nghe con chia sẻ thêm về cảm giác này không?"</em>. Hãy công nhận nỗ lực của con trước điểm số hay hành động.</li>
        <li><strong>Dành cho Con cái:</strong> Chủ động chia sẻ các kế hoạch nhỏ của mình trước để cha mẹ bớt lo lắng. Hãy hiểu rằng sự cằn nhằn đôi khi là cách cha mẹ giải tỏa nỗi sợ vô hình về tương lai của con.</li>
      </ul>
    </div>
  `;
  return adviceHTML;
};

// ============================================================================
// COMPONENT CHÍNH CỦA ỨNG DỤNG
// ============================================================================

function App() {
  // --- STATE QUẢN LÝ APP CHÍNH ---
  const [theme, setTheme] = useState("light");
  const [currentView, setCurrentView] = useState("home"); // 'home' | 'mechanism' | 'ai-info' | 'about' | 'contact' | 'login' | 'register' | 'room'

  // --- STATE AUTHENTICATION ---
  const [currentUser, setCurrentUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Xem/Che mật khẩu
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Quản lý tài khoản
  const [profileName, setProfileName] = useState("");
  const [profileAge, setProfileAge] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [profileSavedPassword, setProfileSavedPassword] = useState("");
  const [showSavedPassword, setShowSavedPassword] = useState(false);
  const [profileGender, setProfileGender] = useState("");
  const [profileBirthday, setProfileBirthday] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileAvatarMascotName, setProfileAvatarMascotName] = useState("");

  // Trạng thái Tab SPA của Phòng (Tạo phòng hoặc Tham gia)
  const [activeRoomTab, setActiveRoomTab] = useState("create"); // 'create' | 'join'

  // Trạng thái Popup Alert thông minh
  const [showAuthAlertModal, setShowAuthAlertModal] = useState(false);
  const [authAlertTitle, setAuthAlertTitle] = useState("");
  const [authAlertMessage, setAuthAlertMessage] = useState("");
  const [authAlertIcon, setAuthAlertIcon] = useState("⚠️");
  const [authAlertRedirect, setAuthAlertRedirect] = useState(null);

  // --- STATE BANNER TRÍCH DẪN NGẪU NHIÊN ---
  const [activeQuote, setActiveQuote] = useState(COMFORT_QUOTES[0]);

  // --- STATE ONBOARDING (POPUP CHÀO MỪNG) ---
  const [hasSeenWelcome, setHasSeenWelcome] = useState(true);
  const [welcomeRole, setWelcomeRole] = useState(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  // --- STATE NHẬT KÝ CẢM XÚC ---
  const [emotionLogs, setEmotionLogs] = useState([]);

  // --- STATE THỬ THÁCH GIAO TIẾP (7 NGÀY) ---
  const [challengeProgress, setChallengeProgress] = useState([]);
  const [lastChallengeDate, setLastChallengeDate] = useState("");
  const [timeUntilMidnight, setTimeUntilMidnight] = useState("");

  // --- STATE QUẢN LÝ PHÒNG ---
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [isRoomLoading, setIsRoomLoading] = useState(false);
  // Duplicate isRoomLoading removed
  const [savedConclusions, setSavedConclusions] = useState([]);
  const [savedRoomIds, setSavedRoomIds] = useState([]);
  const [activeViewedConclusion, setActiveViewedConclusion] = useState(null);
  const [activeReviewAdvice, setActiveReviewAdvice] = useState(null);

  // Trạng thái xem/che mật khẩu cho phòng
  const [showCreateRoomPass, setShowCreateRoomPass] = useState(false);
  const [showJoinRoomPass, setShowJoinRoomPass] = useState(false);

  // Form tạo phòng
  const [createRoomName, setCreateRoomName] = useState("");
  const [createRoomPass, setCreateRoomPass] = useState("");
  const [createCreatorName, setCreateCreatorName] = useState("");
  const [createCreatorRole, setCreateCreatorRole] = useState("parent"); // 'parent' | 'child'

  // Form tham gia phòng
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinRoomPass, setJoinRoomPass] = useState("");
  const [joinUserName, setJoinUserName] = useState("");
  const [joinUserRole, setJoinUserRole] = useState("child"); // 'parent' | 'child'
  const [roomError, setRoomError] = useState("");

  // Editor tạo câu hỏi
  const [newQuestionText, setNewQuestionText] = useState("");

  // Trình trả lời câu hỏi bài test
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [tempAnswerText, setTempAnswerText] = useState("");
  const [tempEmotion, setTempEmotion] = useState("hopeful"); // 'happy' | 'anxious' | 'hopeful' | 'stressed'

  // Form liên hệ
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");

  // ============================================================================
  // KHỞI TẠO & ĐỒNG BỘ THỜI GIAN THỰC (LOCAL STORAGE EVENT SYNC)
  // ============================================================================

  // Fetch AI advice when entering review mode or changing review question
  useEffect(() => {
    const fetchReviewAdvice = async () => {
      if (activeRoom && activeRoom.status === "review") {
        setActiveReviewAdvice(null);
        const revIdx = activeRoom.currentReviewIndex;
        const activeQ = activeRoom.compiledQuestions[revIdx];
        const parents = activeRoom.members.filter((m) => m.role === "parent");
        const children = activeRoom.members.filter((m) => m.role === "child");

        const parentText = parents
          .map(
            (p) => `[${p.name}]: ${p.answers[revIdx]?.text || "Chưa trả lời"}`,
          )
          .join(" | ");
        const childText = children
          .map(
            (c) => `[${c.name}]: ${c.answers[revIdx]?.text || "Chưa trả lời"}`,
          )
          .join(" | ");

        const getModeEmotion = (members) => {
          const counts = {};
          members.forEach((m) => {
            const emo = m.answers[revIdx]?.emotion;
            if (emo) counts[emo] = (counts[emo] || 0) + 1;
          });
          let maxEmo = "hopeful";
          let maxCount = 0;
          for (const [emo, count] of Object.entries(counts)) {
            if (count > maxCount) {
              maxCount = count;
              maxEmo = emo;
            }
          }
          return maxEmo;
        };

        try {
          const response = await fetch(`${API_URL}/api/analyze-understanding`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: activeQ.text,
              parentAns: parentText,
              parentEmo: getModeEmotion(parents),
              childAns: childText,
              childEmo: getModeEmotion(children),
            }),
          });
          const data = await response.json();
          setActiveReviewAdvice(data.adviceHTML);
        } catch (e) {
          console.error(e);
          setActiveReviewAdvice({
            success: false,
            similarity:
              "Lỗi kết nối Backend (Node.js). Vui lòng kiểm tra server.",
            understanding: 0,
            trust: 0,
            conflict: 0,
            parentAdvice: "Không tải được dữ liệu.",
            childAdvice: "Không tải được dữ liệu.",
            action: "Thử lại sau",
          });
        }
      }
    };
    fetchReviewAdvice();
  }, [activeRoom?.status, activeRoom?.currentReviewIndex]);

  // Load cấu hình ban đầu
  useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem("HN_theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    // User session - Cache-first strategy: tải ngay từ localStorage, sau đó refresh ngầm từ API
    const savedUser = localStorage.getItem("HN_current_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);

      // Nạp dữ liệu cá nhân từ cache ngay lập tức
      const cachedEmotions = localStorage.getItem("HN_emotion_logs");
      if (cachedEmotions) setEmotionLogs(JSON.parse(cachedEmotions));
      const cachedChallenge = localStorage.getItem("HN_challenge_progress");
      if (cachedChallenge) setChallengeProgress(JSON.parse(cachedChallenge));
      const cachedConclusions = localStorage.getItem("HN_saved_conclusions");
      if (cachedConclusions) setSavedConclusions(JSON.parse(cachedConclusions));

      // Background refresh: cập nhật dữ liệu mới nhất từ server (không chặn UI)
      fetch(
        `${API_URL}/api/auth/profile-refresh?email=${encodeURIComponent(parsedUser.email)}`,
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.user) {
            const avatar = getAvatarByEmail(data.user.email);
            const refreshedUser = {
              email: data.user.email,
              name: data.user.name,
              mascot: data.user.mascot || avatar.mascot,
              mascotName: data.user.mascotName || avatar.name,
              avatarColor: avatar.color,
              age: data.user.age || "",
              gender: data.user.gender || "",
              birthday: data.user.birthday || "",
            };
            setCurrentUser(refreshedUser);
            localStorage.setItem(
              "HN_current_user",
              JSON.stringify(refreshedUser),
            );
            if (data.user.emotionLogs) {
              setEmotionLogs(data.user.emotionLogs);
              localStorage.setItem(
                "HN_emotion_logs",
                JSON.stringify(data.user.emotionLogs),
              );
            }
            if (data.user.savedConclusions) {
              setSavedConclusions(data.user.savedConclusions);
              localStorage.setItem(
                "HN_saved_conclusions",
                JSON.stringify(data.user.savedConclusions),
              );
            }
          }
        })
        .catch(() => {}); // Bỏ qua lỗi nếu offline
    }

    // Bookmarked/Saved Rooms
    const savedBookmarks = localStorage.getItem("HN_saved_room_ids");
    if (savedBookmarks) {
      setSavedRoomIds(JSON.parse(savedBookmarks));
    }

    // Nạp danh sách kết luận đã lưu
    const storedConclusions = localStorage.getItem("HN_saved_conclusions");
    if (storedConclusions) {
      setSavedConclusions(JSON.parse(storedConclusions));
    }

    // Nạp Onboarding
    const savedWelcome = localStorage.getItem("HN_has_seen_welcome");
    if (!savedWelcome) {
      setHasSeenWelcome(false);
    }

    // Nạp Nhật ký cảm xúc
    const savedEmotions = localStorage.getItem("HN_emotion_logs");
    if (savedEmotions) {
      setEmotionLogs(JSON.parse(savedEmotions));
    }

    // Nạp Thử thách
    const savedChallenge = localStorage.getItem("HN_challenge_progress");
    if (savedChallenge) {
      setChallengeProgress(JSON.parse(savedChallenge));
    }
    const savedLastChallenge = localStorage.getItem("HN_last_challenge_date");
    if (savedLastChallenge) {
      setLastChallengeDate(savedLastChallenge);
    }

    // Load tất cả các phòng
    // Load tất cả các phòng đã chuyển sang useEffect riêng có polling

    // Sinh ngẫu nhiên trích dẫn
    const randIndex = Math.floor(Math.random() * COMFORT_QUOTES.length);
    setActiveQuote(COMFORT_QUOTES[randIndex]);

    // Chạy thử Sandbox AI
  }, []);

  // Đồng hồ đếm ngược đến nửa đêm cho thử thách
  useEffect(() => {
    let interval;
    if (
      currentView === "challenge" &&
      lastChallengeDate === new Date().toISOString().split("T")[0]
    ) {
      const updateTimer = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const diff = tomorrow - now;

        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeUntilMidnight(
          `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
        );
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(interval);
  }, [currentView, lastChallengeDate]);

  // Nạp dữ liệu profile khi vào view quản lý tài khoản hoặc khi thay đổi user
  useEffect(() => {
    if (currentUser) {
      const users = JSON.parse(
        localStorage.getItem("HN_registered_users") || "[]",
      );
      const userFound = users.find(
        (u) => u.email.toLowerCase() === currentUser.email.toLowerCase(),
      );
      if (userFound) {
        setProfileName(userFound.name || "");
        setProfileAge(userFound.age || "");
        setProfileGender(userFound.gender || "");
        setProfileBirthday(userFound.birthday || "");
        setProfileAvatar(userFound.mascot || currentUser.mascot || "🦊");
        setProfileAvatarMascotName(
          userFound.mascotName || currentUser.mascotName || "Mascot",
        );
        setProfileSavedPassword(userFound.password || "");
      }
      setProfilePassword("");
      setProfileSuccess("");
      setProfileError("");
    }
  }, [currentUser, currentView]);

  // Đọc danh sách phòng từ MongoDB
  const loadRoomsFromAPI = async () => {
    console.log("REST ROOMS:", data.data);
    try {
      const res = await fetch(`${API_URL}/api/rooms`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        const parsedRooms = data.data;
        setRooms(parsedRooms);

        // Đồng bộ phòng hiện tại nếu đang trong phòng
        const activeRoomId = localStorage.getItem("HN_active_room_id");
        if (activeRoomId) {
          const found = parsedRooms.find((r) => r.id === activeRoomId);
          if (found) {
            setActiveRoom(found);
          }
        }
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách phòng:", err);
    }
  };

  // Real-time room sync via WebSocket (thay thế polling 1.5s)
  useEffect(() => {
    // Load lần đầu qua REST API để có dữ liệu ngay
    loadRoomsFromAPI();

    // Kết nối WebSocket
    const wsProtocol = API_URL.startsWith("https") ? "wss" : "ws";
    const wsHost = new URL(API_URL).host;
    const wsUrl = `${wsProtocol}://${wsHost}/ws/rooms`;

    let ws = null;
    let reconnectTimeout = null;
    let reconnectDelay = 1000; // Bắt đầu 1s, tăng dần
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;
      try {
        ws = new WebSocket(wsUrl);
      } catch (err) {
        console.error("WebSocket creation error:", err);
        // Fallback: thử lại sau
        reconnectTimeout = setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30000);
        return;
      }

      ws.onopen = () => {
        console.log("WebSocket connected");
        reconnectDelay = 1000; // Reset delay khi kết nối thành công
      };

      ws.onmessage = (event) => {
        console.log("WS ROOMS:", data.rooms);
        try {
          const data = JSON.parse(event.data);
          if (data.type === "rooms" && Array.isArray(data.rooms)) {
            setRooms(data.rooms);
            // Đồng bộ phòng đang hoạt động
            const activeRoomId = localStorage.getItem("HN_active_room_id");
            if (activeRoomId) {
              const found = data.rooms.find((r) => r.id === activeRoomId);
              if (found) {
                setActiveRoom(found);
              }
            }
          }
        } catch (err) {
          console.error("WebSocket parse error:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

      ws.onclose = () => {
        console.log(
          "WebSocket disconnected, reconnecting in",
          reconnectDelay,
          "ms",
        );
        if (isMounted) {
          reconnectTimeout = setTimeout(connect, reconnectDelay);
          reconnectDelay = Math.min(reconnectDelay * 2, 30000);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  // ============================================================================
  // CÁC HÀM XỬ LÝ THEME & ĐIỀU HƯỚNG
  // ============================================================================

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("HN_theme", newTheme);
  };

  const navigateTo = (view) => {
    setCurrentView(view);
    setAuthError("");
    setAuthSuccess("");
    setRoomError("");
    window.scrollTo(0, 0);

    // Đổi trích dẫn ngẫu nhiên cho thêm cảm xúc
    const randIndex = Math.floor(Math.random() * COMFORT_QUOTES.length);
    setActiveQuote(COMFORT_QUOTES[randIndex]);
  };

  // ============================================================================
  // CÁC HÀM XỬ LÝ AUTHENTICATION (ĐĂNG NHẬP / ĐĂNG KÝ)
  // ============================================================================

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!regEmail || !regPassword || !regName) {
      setAuthError("Vui lòng điền đầy đủ thông tin đăng ký.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          name: regName,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Đăng ký thất bại.");
        return;
      }

      setRegEmail("");
      setRegPassword("");
      setRegName("");
      // Tự động chuyển sang giao diện đăng nhập và hiển thị thông báo thành công
      setCurrentView("login");
      setAuthSuccess("Đăng ký tài khoản thành công! Hãy đăng nhập ngay.");
    } catch (err) {
      console.error("Register error:", err);
      setAuthError(err.message);
    }
  };

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setAuthError("");

  //   if (!loginEmail || !loginPassword) {
  //     setAuthError("Vui lòng nhập Email và Mật khẩu.");
  //     return;
  //   }

  //   try {
  //     const res = await fetch(`${API_URL}/api/auth/login`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email: loginEmail, password: loginPassword }),
  //     });
  //     // const data = await res.json();

  //     // if (!res.ok) {
  //     //   throw new Error(data.error || "Cập nhật thất bại");
  //     // }
  //     let data = {};

  //     try {
  //       data = await res.json();
  //     } catch {
  //       throw new Error("Server trả dữ liệu không hợp lệ");
  //     }

  //     if (!res.ok) {
  //       console.log("LOGIN FAIL:", data);

  //       throw new Error(data.error || data.message || `Lỗi ${res.status}`);
  //     }

  //     // Sinh ảnh đại diện mặc định nếu server chưa lưu
  //     const avatar = getAvatarByEmail(data.user.email);

  //     const loggedInUser = {
  //       email: data.user.email,
  //       name: data.user.name,
  //       mascot: data.user.mascot || avatar.mascot,
  //       mascotName: data.user.mascotName || avatar.name,
  //       avatarColor: avatar.color,
  //       age: data.user.age || "",
  //       gender: data.user.gender || "",
  //       birthday: data.user.birthday || "",
  //     };

  //     setCurrentUser(loggedInUser);
  //     localStorage.setItem("HN_current_user", JSON.stringify(loggedInUser));

  //     setLoginEmail("");
  //     setLoginPassword("");
  //     navigateTo("home");
  //   } catch (err) {
  //     console.error("Login error:", err);
  //     setAuthError(err.message);
  //   }
  // };
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!loginEmail || !loginPassword) {
      setAuthError("Vui lòng nhập Email và Mật khẩu.");
      return;
    }

    try {
      console.log("Đang gọi:", `${API_URL}/api/auth/login`);

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      console.log("Status:", res.status);

      const text = await res.text();

      console.log("Response:", text);

      let data = {};

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server không trả JSON");
      }

      if (!res.ok) {
        throw new Error(data.error || `Lỗi ${res.status}`);
      }

      const avatar = getAvatarByEmail(data.user.email);

      const loggedInUser = {
        email: data.user.email,
        name: data.user.name,
        mascot: data.user.mascot || avatar.mascot,
        mascotName: data.user.mascotName || avatar.name,
        avatarColor: avatar.color,
        age: data.user.age || "",
        gender: data.user.gender || "",
        birthday: data.user.birthday || "",
      };

      setCurrentUser(loggedInUser);
      localStorage.setItem("HN_current_user", JSON.stringify(loggedInUser));

      if (data.user.emotionLogs) {
        setEmotionLogs(data.user.emotionLogs);
        localStorage.setItem(
          "HN_emotion_logs",
          JSON.stringify(data.user.emotionLogs),
        );
      }
      if (data.user.challengeProgress) {
        setChallengeProgress(data.user.challengeProgress);
        localStorage.setItem(
          "HN_challenge_progress",
          JSON.stringify(data.user.challengeProgress),
        );
        if (data.user.challengeProgress.length > 0) {
          localStorage.setItem(
            "HN_last_challenge_date",
            new Date().toISOString().split("T")[0],
          );
        }
      }
      if (data.user.savedConclusions) {
        setSavedConclusions(data.user.savedConclusions);
        localStorage.setItem(
          "HN_saved_conclusions",
          JSON.stringify(data.user.savedConclusions),
        );
      }

      navigateTo("home");
    } catch (err) {
      console.error(err);

      setAuthError(err.message);
    }
  };

  const syncUserDataToAPI = (dataToSync) => {
    const user = JSON.parse(localStorage.getItem("HN_current_user"));
    if (!user) return;
    fetch(`${API_URL}/api/auth/sync`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, ...dataToSync }),
    }).catch((err) => console.error("Lỗi đồng bộ dữ liệu cá nhân:", err));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("HN_current_user");

    // Thoát phòng nếu đang ở trong
    if (activeRoom) {
      handleLeaveRoom();
    }
    navigateTo("home");
  };

  // Lưu thông tin chỉnh sửa tài khoản (Tên, Tuổi, Giới tính, Ngày sinh - Các trường này không bắt buộc trừ Tên)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");

    if (!profileName.trim()) {
      setProfileError("Tên hiển thị không được để trống.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          name: profileName.trim(),
          age: profileAge,
          gender: profileGender,
          birthday: profileBirthday,
          mascot: profileAvatar,
          mascotName: profileAvatarMascotName,
          password: profilePassword.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setProfileError(data.error || "Cập nhật thất bại.");
        return;
      }

      // Cập nhật phiên đăng nhập (session) hiện thời
      const updatedSessionUser = {
        ...currentUser,
        name: data.user.name,
        mascot: data.user.mascot,
        mascotName: data.user.mascotName,
        age: data.user.age,
        gender: data.user.gender,
        birthday: data.user.birthday,
      };
      setCurrentUser(updatedSessionUser);
      localStorage.setItem(
        "HN_current_user",
        JSON.stringify(updatedSessionUser),
      );

      setProfileSuccess("Cập nhật thông tin tài khoản thành công! 🌸");
    } catch (err) {
      console.error("Profile update error:", err);
      setProfileError(err.message);
    }
  };

  // Xử lý paste ảnh từ clipboard
  const handleImagePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            setProfileAvatar(event.target.result); // base64 string
            setProfileAvatarMascotName("Ảnh Đại Diện Dán");
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
  };

  // Xử lý tải ảnh lên từ thư viện
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileAvatar(event.target.result); // base64 string
        setProfileAvatarMascotName("Ảnh Đại Diện Tải Lên");
      };
      reader.readAsDataURL(file);
    }
  };

  // ============================================================================
  // CÁC HÀM XỬ LÝ PHÒNG TƯƠNG TÁC (ROOM LOGIC)
  // ============================================================================

  // Cập nhật và lưu danh sách phòng đồng bộ lên MongoDB
  const updateRoomsInAPI = (updatedRooms, modifiedRoomId = null) => {
    setRooms(updatedRooms);

    let currentActive = null;
    if (activeRoom) {
      currentActive = updatedRooms.find((r) => r.id === activeRoom.id);
      if (currentActive) {
        setActiveRoom(currentActive);
      } else {
        setActiveRoom(null);
        localStorage.removeItem("HN_active_room_id");
      }
    }

    const roomToSyncId =
      modifiedRoomId ||
      (currentActive
        ? currentActive.id
        : updatedRooms[updatedRooms.length - 1]?.id);
    const roomToSync = updatedRooms.find((r) => r.id === roomToSyncId);

    if (roomToSync) {
      fetch(`${API_URL}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomToSync),
      }).catch((err) => console.error("Lỗi lưu phòng:", err));
    }
  };

  // Tạo phòng mới
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setRoomError("");
    // UI Loading overlay
    // const LoadingOverlay = () => (
    //   <div className="loading-overlay">
    //     <div className="spinner"></div>
    //   </div>
    // );
    // Loading indicator start
    setIsRoomLoading(true);
    // 1. Yêu cầu đăng nhập để tạo phòng
    if (!currentUser) {
      setAuthAlertTitle("Yêu Cầu Đăng Nhập");
      setAuthAlertMessage(
        "Bạn cần đăng nhập tài khoản trước khi tạo phòng kết nối để hệ thống ghi nhớ lịch sử thấu cảm của gia đình bạn.",
      );
      setAuthAlertIcon("⚠️");
      setAuthAlertRedirect("login");
      setShowAuthAlertModal(true);
      setIsRoomLoading(false);
      return;
    }

    // 2. Yêu cầu nhập đầy đủ thông tin phòng
    if (
      !createRoomName.trim() ||
      !createRoomPass.trim() ||
      !createCreatorName.trim()
    ) {
      setAuthAlertTitle("Thiếu Thông Tin Tạo Phòng");
      setAuthAlertMessage(
        "Vui lòng nhập đầy đủ các thông tin: Tên phòng kết nối, Mật khẩu phòng và Tên hiển thị của bạn.",
      );
      setAuthAlertIcon("⚠️");
      setAuthAlertRedirect(null);
      setShowAuthAlertModal(true);
      setIsRoomLoading(false);
      return;
    }

    // Tạo ID phòng độc nhất ngẫu nhiên: HN-XXXX
    let newId;
    let isUnique = false;
    while (!isUnique) {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      newId = `HN-${randNum}`;
      isUnique = !rooms.some((r) => r.id === newId);
    }

    const newRoom = {
      id: newId,
      name: createRoomName,
      password: createRoomPass,
      status: "waiting", // 'waiting' | 'quiz' | 'review' | 'completed'
      creatorName: createCreatorName,
      members: [
        {
          name: createCreatorName,
          role: createCreatorRole,
          finished: false,
          questions: [],
          answers: {},
        },
      ],
      compiledQuestions: [],
      currentReviewIndex: 0,
    };

    // Reset form after creating room
    setCreateRoomName("");
    setCreateRoomPass("");
    setCreateCreatorName("");
    // Update rooms state and sync to API
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    await updateRoomsInAPI(updatedRooms);
    // Set active room and store active room id
    setActiveRoom(newRoom);
    localStorage.setItem("HN_active_room_id", newRoom.id);
    // Store creator role for this room
    sessionStorage.setItem(`HN_room_role_${newRoom.id}`, "creator");
    // Store creator username for reference (already stored elsewhere maybe)
    sessionStorage.setItem(`HN_room_username_${newRoom.id}`, createCreatorName);
    // Navigate to room view
    navigateTo("room");
    setIsRoomLoading(false);
  };

  // Tham gia phòng có sẵn
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setRoomError("");
    setIsRoomLoading(true);
    // Validate input
    if (!joinRoomId.trim() || !joinRoomPass.trim() || !joinUserName.trim()) {
      setAuthAlertTitle("Thiếu Thông Tin Kết Nối");
      setAuthAlertMessage(
        "Vui lòng điền đầy đủ các thông tin: Mã phòng kết nối (ID), Mật khẩu phòng và Tên hiển thị của bạn.",
      );
      setAuthAlertRedirect(null);
      setShowAuthAlertModal(true);
      setIsRoomLoading(false);
      return;
    }
    // Find room index locally
    let foundRoomIndex = rooms.findIndex(
      (r) => r.id.toUpperCase() === joinRoomId.toUpperCase(),
    );
    let currentRooms = rooms;
    if (foundRoomIndex === -1) {
      try {
        const response = await fetch(`${API_URL}/api/rooms/${joinRoomId}`);
        if (response.ok) {
          const fetched = await response.json();
          const fetchedRoom = fetched.success ? fetched.data : fetched;
          const updatedRooms = [...rooms, fetchedRoom];
          await updateRoomsInAPI(updatedRooms);
          setRooms(updatedRooms);
          currentRooms = updatedRooms;
          foundRoomIndex = updatedRooms.findIndex(
            (r) => r.id.toUpperCase() === joinRoomId.toUpperCase(),
          );
        }
      } catch (e) {
        console.error(e);
      }
      if (foundRoomIndex === -1) {
        setRoomError("⚠️ Không tìm thấy phòng kiểm tra này.");
        setIsRoomLoading(false);
        return;
      }
    }
    const room = currentRooms[foundRoomIndex];
    if (room.password !== joinRoomPass) {
      setRoomError("Mật khẩu phòng không đúng.");
      setIsRoomLoading(false);
      return;
    }
    // Kiểm tra xem đã có thành viên nào trùng tên chưa
    const existingMemberIndex = room.members.findIndex(
      (m) => m.name.toLowerCase() === joinUserName.toLowerCase(),
    );
    let updatedRoom = { ...room };
    if (existingMemberIndex === -1) {
      // Thêm thành viên mới
      updatedRoom.members = [
        ...room.members,
        {
          name: joinUserName,
          role: joinUserRole,
          finished: false,
          questions: [],
          answers: {},
        },
      ];
    }
    const updatedRooms = [...rooms];
    updatedRooms[foundRoomIndex] = updatedRoom;
    await updateRoomsInAPI(updatedRooms);
    // Store joiner info
    sessionStorage.setItem(`HN_room_username_${room.id}`, joinUserName);
    sessionStorage.setItem(`HN_room_role_${room.id}`, joinUserRole);
    localStorage.setItem("HN_active_room_id", room.id);
    setActiveRoom(updatedRoom);
    // Bookmark phòng này
    toggleBookmarkRoom(room.id, true);
    // Reset form
    setJoinRoomId("");
    setJoinRoomPass("");
    setJoinUserName("");
    navigateTo("room");
    setIsRoomLoading(false);
  };

  // Rời phòng hiện tại
  const handleLeaveRoom = () => {
    localStorage.removeItem("HN_active_room_id");
    setActiveRoom(null);
    setCurrentQuestionIndex(0);
    setTempAnswerText("");
    navigateTo("home");
  };

  // Lưu/Xóa Bookmark phòng
  const toggleBookmarkRoom = (roomId, forceSave = false) => {
    let updated;
    if (savedRoomIds.includes(roomId) && !forceSave) {
      updated = savedRoomIds.filter((id) => id !== roomId);
    } else {
      updated = [...new Set([...savedRoomIds, roomId])];
    }
    setSavedRoomIds(updated);
    localStorage.setItem("HN_saved_room_ids", JSON.stringify(updated));
  };

  // Lưu Báo Cáo Kết Luận Thấu Hiểu của phòng đã hoàn thành
  const handleSaveConclusion = (room) => {
    if (!currentUser) {
      setAuthAlertTitle("Yêu Cầu Đăng Nhập");
      setAuthAlertMessage(
        "Bạn cần có tài khoản và đăng nhập để có thể lưu trữ vĩnh viễn các kết luận thấu cảm từ AI.",
      );
      setAuthAlertRedirect("login");
      setShowAuthAlertModal(true);
      return;
    }

    const newConclusion = {
      id: `${room.id}_${Date.now()}`,
      roomId: room.id,
      userEmail: currentUser.email.toLowerCase(),
      roomName: room.name,
      creatorName: room.creatorName,
      joinerName:
        room.members
          .filter((m) => m.name !== room.creatorName)
          .map((m) => m.name)
          .join(", ") || "Nhiều thành viên",
      creatorRole:
        room.members.find((m) => m.name === room.creatorName)?.role || "parent",
      joinerRole: "mixed",
      score: calculateUnderstandingScore(room),
      savedAt: new Date().toISOString(),
      members: room.members, // Store members directly
      compiledQuestions: room.compiledQuestions,
    };

    // Kiểm tra xem đã lưu kết luận của phòng này chưa
    const existingIndex = savedConclusions.findIndex(
      (c) =>
        c.roomId === room.id && c.userEmail === currentUser.email.toLowerCase(),
    );

    let updated;
    if (existingIndex !== -1) {
      // Ghi đè báo cáo mới nhất
      updated = [...savedConclusions];
      updated[existingIndex] = newConclusion;
    } else {
      updated = [newConclusion, ...savedConclusions];
    }

    setSavedConclusions(updated);
    localStorage.setItem("HN_saved_conclusions", JSON.stringify(updated));
    syncUserDataToAPI({ savedConclusions: updated });

    setAuthAlertTitle("Lưu Trữ Thành Công 🌸");
    setAuthAlertMessage(
      `Báo cáo thấu cảm của phòng "${room.name}" đã được lưu trữ an toàn trong kho tư liệu của bạn.`,
    );
    setAuthAlertIcon("💖");
    setAuthAlertRedirect(null);
    setShowAuthAlertModal(true);
  };

  // Xóa kết luận đã lưu
  const handleDeleteConclusion = (conclusionId) => {
    const updated = savedConclusions.filter((c) => c.id !== conclusionId);
    setSavedConclusions(updated);
    localStorage.setItem("HN_saved_conclusions", JSON.stringify(updated));
    syncUserDataToAPI({ savedConclusions: updated });
  };

  const handleQuickJoinSavedRoom = (room) => {
    // Xác định vai trò đã từng lưu của phòng này hoặc hỏi
    const prevRole = sessionStorage.getItem(`HN_room_role_${room.id}`);
    const prevUsername = sessionStorage.getItem(`HN_room_username_${room.id}`);

    if (prevRole && prevUsername) {
      localStorage.setItem("HN_active_room_id", room.id);
      setActiveRoom(room);
      navigateTo("room");
    } else {
      // Đưa thông tin vào form để kết nối lại dễ dàng
      setActiveRoomTab("join");
      setJoinRoomId(room.id);
      setJoinRoomPass(room.password);
      setJoinUserName(currentUser ? currentUser.name : "");
      navigateTo("home");
      // Cuộn xuống mục tham gia
      setTimeout(() => {
        document
          .getElementById("join-room-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  };

  // Lấy vai trò của người dùng hiện tại trong phòng hoạt động
  const getMyRoleInRoom = () => {
    if (!activeRoom) return null;
    return sessionStorage.getItem(`HN_room_role_${activeRoom.id}`); // 'creator' hoặc 'joiner'
  };

  // Lấy tên hiển thị của người dùng trong phòng
  const getMyUsernameInRoom = () => {
    if (!activeRoom) return "";
    return (
      sessionStorage.getItem(`HN_room_username_${activeRoom.id}`) ||
      "Thành viên"
    );
  };

  // ============================================================================
  // CƠ CHẾ GIAI ĐOẠN 1: SOẠN CÂU HỎI (QUESTION CREATION)
  // ============================================================================

  const handleAddQuestion = () => {
    if (!newQuestionText.trim() || !activeRoom) return;

    const myName = getMyUsernameInRoom();
    const updatedRooms = rooms.map((r) => {
      if (r.id === activeRoom.id) {
        const nextMembers = r.members.map((m) => {
          if (m.name === myName) {
            return {
              ...m,
              questions: [...m.questions, newQuestionText.trim()],
            };
          }
          return m;
        });
        return { ...r, members: nextMembers };
      }
      return r;
    });

    updateRoomsInAPI(updatedRooms);
    setNewQuestionText("");
  };

  const handleSelectPresetQuestion = (qText) => {
    setNewQuestionText(qText);
  };

  const handleRemoveQuestion = (index) => {
    if (!activeRoom) return;
    const myName = getMyUsernameInRoom();
    const updatedRooms = rooms.map((r) => {
      if (r.id === activeRoom.id) {
        const nextMembers = r.members.map((m) => {
          if (m.name === myName) {
            const filtered = m.questions.filter((_, i) => i !== index);
            return { ...m, questions: filtered };
          }
          return m;
        });
        return { ...r, members: nextMembers };
      }
      return r;
    });
    updateRoomsInAPI(updatedRooms);
  };

  // Bấm Hoàn thành biên soạn câu hỏi của cá nhân
  const handleFinishMyQuestions = () => {
    if (!activeRoom) return;
    const myName = getMyUsernameInRoom();

    const updatedRooms = rooms.map((r) => {
      if (r.id === activeRoom.id) {
        const nextMembers = r.members.map((m) => {
          if (m.name === myName) return { ...m, finished: true };
          return m;
        });
        return { ...r, members: nextMembers };
      }
      return r;
    });

    updateRoomsInAPI(updatedRooms);
  };

  // Chủ phòng bấm Bắt đầu Bài Test Chung
  const handleStartQuiz = () => {
    if (!activeRoom) return;

    const updatedRooms = rooms.map((r) => {
      if (r.id === activeRoom.id) {
        // Trộn và gộp toàn bộ câu hỏi
        let merged = [];
        r.members.forEach((m) => {
          m.questions.forEach((q) => {
            merged.push({ text: q, creator: m.role });
          });
        });

        return {
          ...r,
          status: "quiz",
          compiledQuestions: merged,
        };
      }
      return r;
    });

    updateRoomsInAPI(updatedRooms);
  };

  // ============================================================================
  // CƠ CHẾ GIAI ĐOẠN 2: LÀM BÀI TEST CHUNG (COMPILED TEST)
  // ============================================================================

  const handleNextQuizQuestion = () => {
    if (!activeRoom || !tempAnswerText.trim()) return;

    const myName = getMyUsernameInRoom();
    const qId = currentQuestionIndex;

    const updatedRooms = rooms.map((r) => {
      if (r.id === activeRoom.id) {
        const nextMembers = r.members.map((m) => {
          if (m.name === myName) {
            return {
              ...m,
              answers: {
                ...m.answers,
                [qId]: { text: tempAnswerText.trim(), emotion: tempEmotion },
              },
            };
          }
          return m;
        });

        const nextRoomState = { ...r, members: nextMembers };

        // Kiểm tra xem tab hiện tại đã hoàn thành toàn bộ câu hỏi chưa
        const isLastQ = currentQuestionIndex === r.compiledQuestions.length - 1;
        if (isLastQ) {
          // Kiểm tra xem TẤT CẢ mọi người đã hoàn thành chưa
          const totalQCount = r.compiledQuestions.length;
          const allCompleted = nextMembers.every(
            (m) => Object.keys(m.answers).length === totalQCount,
          );

          if (allCompleted) {
            // Tất cả đã làm xong bài kiểm tra -> Chuyển sang Giai đoạn 3 (review)
            return {
              ...nextRoomState,
              status: "review",
              currentReviewIndex: 0,
            };
          }
        }

        return nextRoomState;
      }
      return r;
    });

    updateRoomsInAPI(updatedRooms);

    // Tiến hành câu hỏi tiếp theo hoặc ở trạng thái chờ
    if (currentQuestionIndex < activeRoom.compiledQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      // Load câu trả lời cũ nếu có, hoặc reset trống
      const myMember = activeRoom.members.find((m) => m.name === myName);
      const existingAnswer = myMember?.answers[currentQuestionIndex + 1];
      setTempAnswerText(existingAnswer ? existingAnswer.text : "");
      setTempEmotion(existingAnswer ? existingAnswer.emotion : "hopeful");
    } else {
      // Đã hoàn thành câu cuối, chờ mọi người
      setCurrentQuestionIndex(activeRoom.compiledQuestions.length); // Trigger waiting view inside room
    }
  };

  // ============================================================================
  // CƠ CHẾ GIAI ĐOẠN 3: DUYỆT BÁO CÁO & LỜI KHUYÊN AI (REVIEW & ADVICE)
  // ============================================================================

  const handleNextReviewQuestion = () => {
    if (!activeRoom) return;

    const nextIndex = activeRoom.currentReviewIndex + 1;
    const isFinishedAll = nextIndex === activeRoom.compiledQuestions.length;

    const updatedRooms = rooms.map((r) => {
      if (r.id === activeRoom.id) {
        return {
          ...r,
          currentReviewIndex: nextIndex,
          status: isFinishedAll ? "completed" : "review",
        };
      }
      return r;
    });

    updateRoomsInAPI(updatedRooms);
  };

  // ============================================================================
  // CÁC HÀM XỬ LÝ TRANG TĨNH TẬP TRUNG CHĂM SÓC KHÁCH HÀNG / SANDBOX
  // ============================================================================

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;

    setContactSuccess(
      "Lời nhắn của bạn đã được gửi đi bằng cả sự trân trọng. Chúng tôi sẽ phản hồi lại bạn sớm nhất qua email!",
    );
    setContactName("");
    setContactEmail("");
    setContactMsg("");
  };

  // Tạo hình đại diện Google/Gmail đẹp mắt dựa trên ký tự đầu tiên của email/tên
  const getGmailAvatarUrl = (email, name) => {
    if (!email)
      return "https://lh3.googleusercontent.com/a/default-user=s120-c";
    const cleanEmail = email.trim().toLowerCase();
    const firstChar = name
      ? name.charAt(0).toUpperCase()
      : cleanEmail.charAt(0).toUpperCase();

    // Tự động phân phối màu sắc Google dựa trên mã ký tự
    const charCode = firstChar.charCodeAt(0);
    const googleColors = ["4285F4", "EA4335", "FBBC05", "34A853"]; // Google blue, red, yellow, green
    const bgColor = googleColors[charCode % googleColors.length];

    return `https://ui-avatars.com/api/?name=${firstChar}&background=${bgColor}&color=fff&size=128&bold=true`;
  };

  // Tính toán chỉ số thấu hiểu giả lập dựa trên khớp cảm xúc tương đồng
  const calculateUnderstandingScore = (room) => {
    if (!room || !room.compiledQuestions) return 70;

    let matches = 0;
    const total = room.compiledQuestions.length;
    if (total === 0) return 70;

    const parents = room.members.filter((m) => m.role === "parent");
    const children = room.members.filter((m) => m.role === "child");

    for (let i = 0; i < total; i++) {
      let qScore = 0;
      let pairs = 0;

      for (const p of parents) {
        for (const c of children) {
          const cEmo = p.answers[i]?.emotion;
          const jEmo = c.answers[i]?.emotion;

          // Nếu cùng cảm xúc hoặc cả hai đều có cảm xúc tích cực/hy vọng
          if (cEmo === jEmo) {
            qScore += 1.0;
          } else if (
            (cEmo === "hopeful" && jEmo === "happy") ||
            (cEmo === "happy" && jEmo === "hopeful")
          ) {
            qScore += 0.8;
          } else if (
            (cEmo === "anxious" && jEmo === "stressed") ||
            (cEmo === "stressed" && jEmo === "anxious")
          ) {
            qScore += 0.5; // Sự thấu cảm trong nỗi lo
          }
          pairs++;
        }
      }
      if (pairs > 0) {
        matches += qScore / pairs;
      }
    }

    const score = Math.round((matches / total) * 30 + 70); // Dao động từ 70% đến 100% để khích lệ
    return score;
  };

  // ============================================================================
  // TÍNH NĂNG CHIA SẺ
  // ============================================================================
  const handleShare = (title, text) => {
    if (navigator.share) {
      navigator
        .share({
          title: title,
          text: text,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      setAuthAlertTitle("Thông Báo");
      setAuthAlertMessage(
        "Tính năng chia sẻ chưa được hỗ trợ trên thiết bị của bạn. Bạn có thể copy link trang web nhé!",
      );
      setAuthAlertIcon("🔗");
      setAuthAlertRedirect(null);
      setShowAuthAlertModal(true);
    }
  };

  // ============================================================================
  // PHẦN RENDER GIAO DIỆN (UI RENDERING)
  // ============================================================================

  // Tiện ích hiển thị cảm xúc Emoji
  const getEmotionIcon = (emo) => {
    return (
      {
        happy: { emoji: "😊", text: "Vui vẻ" },
        anxious: { emoji: "🥺", text: "Lo âu" },
        hopeful: { emoji: "✨", text: "Hy vọng" },
        stressed: { emoji: "😣", text: "Áp lực" },
      }[emo] || { emoji: "😐", text: "Bình thường" }
    );
  };

  return (
    <>
      {/* POPUP CHÀO MỪNG */}
      {!hasSeenWelcome && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg)",
              borderRadius: "24px",
              padding: "40px",
              maxWidth: "500px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            {!showWelcomeMessage ? (
              <>
                <h2 style={{ fontSize: "28px", marginBottom: "20px" }}>
                  Chào mừng đến với Hiểu Nhau ❤️
                </h2>
                <p
                  style={{
                    marginBottom: "30px",
                    color: "var(--text-muted)",
                    fontSize: "16px",
                  }}
                >
                  Bạn đang tham gia với vai trò nào?
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, padding: "16px", fontSize: "18px" }}
                    onClick={() => {
                      setWelcomeRole("parent");
                      setShowWelcomeMessage(true);
                    }}
                  >
                    👨‍👩‍👧 Phụ huynh
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: "16px", fontSize: "18px" }}
                    onClick={() => {
                      setWelcomeRole("child");
                      setShowWelcomeMessage(true);
                    }}
                  >
                    👦 Học sinh
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                  {welcomeRole === "parent" ? "🌸" : "✨"}
                </div>
                <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>
                  {welcomeRole === "parent"
                    ? "Cảm ơn bạn vì đã chọn Hiểu Nhau"
                    : "Chúng tôi tin ở bạn"}
                </h2>
                <p
                  style={{
                    marginBottom: "30px",
                    color: "var(--text-muted)",
                    fontSize: "16px",
                    lineHeight: "1.6",
                  }}
                >
                  {welcomeRole === "parent"
                    ? "Việc bạn có mặt ở đây đã cho thấy sự nỗ lực và tình yêu thương tuyệt vời mà bạn dành cho con cái. Hãy cùng nhau xây dựng sự thấu cảm nhé."
                    : "Mỗi nỗ lực lắng nghe và chia sẻ của bạn đều rất đáng quý. Đừng ngại ngần mở lòng, gia đình luôn là nơi để trở về."}
                </p>
                <button
                  className="btn btn-primary"
                  style={{ padding: "12px 32px", fontSize: "16px" }}
                  onClick={() => {
                    setHasSeenWelcome(true);
                    localStorage.setItem("HN_has_seen_welcome", "true");
                  }}
                >
                  Bắt đầu trải nghiệm
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* HEADER NAVBAR */}
      <header>
        <div className="container navbar">
          <a className="nav-brand" onClick={() => navigateTo("home")}>
            <span style={{ fontSize: "28px" }}>❤️</span> Hiểu Nhau
          </a>

          <ul className="nav-links">
            <li>
              <a
                className={`nav-item ${currentView === "home" ? "active" : ""}`}
                onClick={() => navigateTo("home")}
              >
                Trang Chủ
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${currentView === "mechanism" ? "active" : ""}`}
                onClick={() => navigateTo("mechanism")}
              >
                Hướng Dẫn
              </a>
            </li>
            {currentUser && (
              <>
                <li>
                  <a
                    className={`nav-item ${currentView === "saved-conclusions" ? "active" : ""}`}
                    onClick={() => navigateTo("saved-conclusions")}
                  >
                    Kết Luận Đã Lưu 📖
                  </a>
                </li>
                <li>
                  <a
                    className={`nav-item ${currentView === "emotion-diary" ? "active" : ""}`}
                    onClick={() => navigateTo("emotion-diary")}
                  >
                    Nhật Ký 📔
                  </a>
                </li>
                <li>
                  <a
                    className={`nav-item ${currentView === "challenge" ? "active" : ""}`}
                    onClick={() => navigateTo("challenge")}
                  >
                    Thử Thách 🎯
                  </a>
                </li>
              </>
            )}
            <li>
              <a
                className={`nav-item ${currentView === "resources" ? "active" : ""}`}
                onClick={() => navigateTo("resources")}
              >
                Tài Nguyên
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${currentView === "ai-info" ? "active" : ""}`}
                onClick={() => navigateTo("ai-info")}
              >
                Tích Hợp AI
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${currentView === "about" ? "active" : ""}`}
                onClick={() => navigateTo("about")}
              >
                Về Chúng Tôi
              </a>
            </li>
            <li>
              <a
                className={`nav-item ${currentView === "contact" ? "active" : ""}`}
                onClick={() => navigateTo("contact")}
              >
                Liên Hệ
              </a>
            </li>
          </ul>

          <div className="nav-actions">
            {/* Theme Toggle Button */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title="Thay đổi giao diện sáng/tối"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {/* Trạng thái Đăng nhập với Mascot hoạt hình ngộ nghĩnh */}
            {currentUser ? (
              <div
                className="user-avatar-badge"
                onClick={() => navigateTo("profile")}
                style={{ cursor: "pointer" }}
                title="Quản lý tài khoản"
              >
                <div
                  className="avatar-circle"
                  style={{
                    backgroundColor: currentUser.avatarColor,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {currentUser.mascot &&
                  (currentUser.mascot.startsWith("data:image") ||
                    currentUser.mascot.startsWith("http")) ? (
                    <img
                      src={currentUser.mascot}
                      alt="avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span className="avatar-img-sim">{currentUser.mascot}</span>
                  )}
                </div>
                <div
                  className="user-avatar-text"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      lineHeight: 1.1,
                    }}
                  >
                    {currentUser.name}
                  </span>
                  <span
                    style={{ fontSize: "10px", color: "var(--text-muted)" }}
                  >
                    {currentUser.mascotName}
                  </span>
                </div>
                <button
                  className="logout-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  title="Đăng xuất"
                >
                  🚪
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigateTo("login")}
                >
                  Đăng Nhập
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigateTo("register")}
                >
                  Đăng Ký
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE OF PAGES */}
      <main className="container animate-fade">
        {/* COMFORT QUOTE BANNER (Hiển thị ngọt ngào ở các trang thông tin) */}
        {["home", "mechanism", "ai-info", "about", "contact"].includes(
          currentView,
        ) && (
          <div className="comfort-banner">
            <p>"{activeQuote.text}"</p>
            <span>— {activeQuote.author}</span>
          </div>
        )}

        {/* ====================================================================
              1. VIEW HOME (TRANG CHỦ + PHÒNG ĐIỀU KHIỂN)
              ==================================================================== */}
        {currentView === "home" && (
          <div>
            <section className="hero-section">
              <div className="hero-content">
                <h1>
                  Đôi khi yêu thương không có nghĩa là đã{" "}
                  <span>hiểu nhau.</span>
                </h1>
                <p>
                  "Hiểu Nhau" là không gian an toàn, riêng tư giúp phụ huynh và
                  con cái xích lại gần nhau hơn. Thông qua quy trình thiết kế
                  câu hỏi chung và làm bài kiểm tra hai bên, AI thấu cảm sẽ đưa
                  ra những lời khuyên nhẹ nhàng, không chỉ trích, hàn gắn tình
                  cảm gia đình.
                </p>
                <div className="hero-btn-group">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigateTo("mechanism")}
                  >
                    Bắt Đầu Ngay
                  </button>
                </div>
              </div>
              <div className="hero-illustration">
                <img
                  src="/hero-cozy.png"
                  alt="Không gian gia đình ấm áp thấu cảm"
                  className="hero-card-illus"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "24px",
                    border: "2px solid var(--border)",
                    boxShadow: "var(--shadow)",
                    display: "block",
                  }}
                />
              </div>
            </section>

            {/* NHẮC NHỞ HÀNG NGÀY */}
            {(() => {
              const todayStr = new Date().toISOString().split("T")[0];
              const hasLoggedEmotionToday = emotionLogs.some(
                (log) => log.date === todayStr,
              );
              const hasCompletedChallengeToday = lastChallengeDate === todayStr;
              const isChallengeDone = challengeProgress.length >= 7;

              if (
                currentUser &&
                (!hasLoggedEmotionToday ||
                  (!hasCompletedChallengeToday && !isChallengeDone))
              ) {
                return (
                  <div
                    className="card animate-fade"
                    style={{
                      marginBottom: "30px",
                      borderLeft: "4px solid var(--primary)",
                      backgroundColor: "var(--accent-light)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      🔔 Nhắc Nhở Hôm Nay
                    </h3>
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {!hasLoggedEmotionToday && (
                        <li
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px",
                            backgroundColor: "white",
                            borderRadius: "8px",
                          }}
                        >
                          <span
                            style={{ fontSize: "15px", color: "var(--text)" }}
                          >
                            Bạn chưa ghi lại cảm xúc hôm nay.
                          </span>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigateTo("emotion-diary")}
                          >
                            Ghi ngay 📔
                          </button>
                        </li>
                      )}
                      {!hasCompletedChallengeToday && !isChallengeDone && (
                        <li
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px",
                            backgroundColor: "white",
                            borderRadius: "8px",
                          }}
                        >
                          <span
                            style={{ fontSize: "15px", color: "var(--text)" }}
                          >
                            Thử thách Ngày {challengeProgress.length + 1} đang
                            chờ bạn.
                          </span>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigateTo("challenge")}
                          >
                            Thực hiện 🎯
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                );
              }
              return null;
            })()}

            {/* BA BẢN ĐIỀU KHIỂN CHÍNH: TẠO PHÒNG - TÌM PHÒNG - LƯU PHÒNG */}
            <section
              id="create-room-section"
              style={{ scrollMarginTop: "100px", paddingTop: "20px" }}
            >
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h2 style={{ fontSize: "32px", marginBottom: "12px" }}>
                  Không Gian Kết Nối Gia Đình
                </h2>
                <p
                  style={{
                    color: "var(--text-muted)",
                    maxWidth: "600px",
                    margin: "0 auto",
                  }}
                >
                  Hãy tạo phòng kiểm tra mới cho gia đình bạn hoặc tham gia
                  phòng đã có sẵn để cùng nhau chia sẻ những điều khó nói.
                </p>
              </div>

              {/* Display errors inside room creation/joining */}
              {roomError && (
                <div
                  style={{
                    backgroundColor: "#FADBD8",
                    color: "#78281F",
                    padding: "16px",
                    borderRadius: "12px",
                    marginBottom: "30px",
                    fontWeight: "600",
                    border: "1.5px solid #F5B7B1",
                    textAlign: "center",
                  }}
                >
                  ⚠️ {roomError}
                </div>
              )}

              {/* SPA Tab Selector: 2 beautiful custom capsule buttons */}
              <div
                className="room-tab-selector"
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  padding: "4px",
                  backgroundColor: "rgba(140, 98, 57, 0.08)",
                  borderRadius: "16px",
                  maxWidth: "400px",
                  margin: "0 auto 32px auto",
                  border: "1.5px solid var(--border)",
                }}
              >
                <button
                  type="button"
                  className={`btn ${activeRoomTab === "create" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveRoomTab("create")}
                  style={{
                    flex: 1,
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontWeight: "700",
                    fontSize: "15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.3s ease",
                    border: "none",
                    backgroundColor:
                      activeRoomTab === "create"
                        ? "var(--primary)"
                        : "transparent",
                    color: activeRoomTab === "create" ? "white" : "var(--text)",
                  }}
                >
                  🏡 Tạo Phòng Mới
                </button>
                <button
                  type="button"
                  className={`btn ${activeRoomTab === "join" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveRoomTab("join")}
                  style={{
                    flex: 1,
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontWeight: "700",
                    fontSize: "15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.3s ease",
                    border: "none",
                    backgroundColor:
                      activeRoomTab === "join"
                        ? "var(--primary)"
                        : "transparent",
                    color: activeRoomTab === "join" ? "white" : "var(--text)",
                  }}
                >
                  🔑 Tham Gia Phòng
                </button>
              </div>

              {/* Centered Mobile Capsule View */}
              <div
                style={{ maxWidth: "480px", margin: "0 auto" }}
                className="animate-slide"
              >
                {/* 1. TẠO PHÒNG MỚI */}
                {activeRoomTab === "create" && (
                  <div className="card animate-fade">
                    <div
                      className="card-icon"
                      style={{
                        backgroundColor: "rgba(224, 122, 95, 0.12)",
                        color: "var(--primary)",
                      }}
                    >
                      🏡
                    </div>
                    <h3 className="card-title">Tạo Phòng Kết Nối Mới</h3>
                    <p className="card-desc" style={{ marginBottom: "20px" }}>
                      Khởi tạo phòng thấu hiểu riêng tư. Bạn sẽ là người đầu
                      tiên soạn thảo các câu hỏi và đợi người thân tham gia đối
                      thoại.
                    </p>

                    <form onSubmit={handleCreateRoom}>
                      <div className="form-group">
                        <label>Tên Phòng Kết Nối</label>
                        <input
                          type="text"
                          autoComplete="off"
                          placeholder="VD: Gia đình thân thương, Bố Mẹ và Tôm..."
                          value={createRoomName}
                          onChange={(e) => setCreateRoomName(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Mật Khẩu Phòng (để bảo mật tối đa)</label>
                        <div style={{ position: "relative" }}>
                          <input
                            type={showCreateRoomPass ? "text" : "password"}
                            autoComplete="off"
                            placeholder="Nhập mật khẩu tự chọn"
                            value={createRoomPass}
                            onChange={(e) => setCreateRoomPass(e.target.value)}
                            style={{ paddingRight: "48px" }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCreateRoomPass(!showCreateRoomPass)
                            }
                            style={{
                              position: "absolute",
                              right: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              fontSize: "18px",
                              cursor: "pointer",
                              padding: "4px",
                              lineHeight: 1,
                            }}
                            title={
                              showCreateRoomPass
                                ? "Ẩn mật khẩu"
                                : "Xem mật khẩu"
                            }
                          >
                            {showCreateRoomPass ? "👁️" : "🙈"}
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Tên Hiển Thị Của Bạn</label>
                        <input
                          type="text"
                          autoComplete="off"
                          placeholder={
                            currentUser
                              ? `Mặc định: ${currentUser.name}`
                              : "VD: Bố Tuấn, Mẹ Hà, Con gái Linh..."
                          }
                          value={createCreatorName}
                          onChange={(e) => setCreateCreatorName(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Vai Trò Của Bạn Trong Phòng</label>
                        <div className="role-picker">
                          <div
                            className={`role-card-opt ${createCreatorRole === "parent" ? "selected" : ""}`}
                            onClick={() => setCreateCreatorRole("parent")}
                          >
                            <span className="role-icon-sim">🐻</span>
                            <span className="role-title-sim">Cha Mẹ</span>
                          </div>
                          <div
                            className={`role-card-opt ${createCreatorRole === "child" ? "selected" : ""}`}
                            onClick={() => setCreateCreatorRole("child")}
                          >
                            <span className="role-icon-sim">🐰</span>
                            <span className="role-title-sim">Con Cái</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                      >
                        Tạo Phòng & Bắt Đầu Ngay
                      </button>
                    </form>
                  </div>
                )}

                {/* 2. THAM GIA PHÒNG SẴN CÓ */}
                {activeRoomTab === "join" && (
                  <div className="card animate-fade" id="join-room-section">
                    <div
                      className="card-icon"
                      style={{
                        backgroundColor: "rgba(61, 90, 128, 0.12)",
                        color: "var(--secondary)",
                      }}
                    >
                      🔑
                    </div>
                    <h3 className="card-title">Tham Gia Phòng Có Sẵn</h3>
                    <p className="card-desc" style={{ marginBottom: "20px" }}>
                      Nhập mã ID phòng và mật khẩu do người thân gửi để cùng
                      tham gia kết nối tâm hồn.
                    </p>

                    <form onSubmit={handleJoinRoom}>
                      <div className="form-group">
                        <label>Mã ID Phòng Kết Nối</label>
                        <input
                          type="text"
                          placeholder="VD: HN-8392"
                          value={joinRoomId}
                          onChange={(e) => {
                            let val = e.target.value;
                            // Tự động loại bỏ dấu cách cuối cùng nếu không có ký tự phía sau
                            if (val.endsWith(" ")) {
                              val = val.trimEnd();
                            }
                            setJoinRoomId(val);
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label>Mật Khẩu Phòng</label>
                        <div style={{ position: "relative" }}>
                          <input
                            type={showJoinRoomPass ? "text" : "password"}
                            placeholder="Nhập mật khẩu phòng"
                            value={joinRoomPass}
                            onChange={(e) => setJoinRoomPass(e.target.value)}
                            style={{ paddingRight: "48px" }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowJoinRoomPass(!showJoinRoomPass)
                            }
                            style={{
                              position: "absolute",
                              right: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              fontSize: "18px",
                              cursor: "pointer",
                              padding: "4px",
                              lineHeight: 1,
                            }}
                            title={
                              showJoinRoomPass ? "Ẩn mật khẩu" : "Xem mật khẩu"
                            }
                          >
                            {showJoinRoomPass ? "👁️" : "🙈"}
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Tên Hiển Thị Của Bạn</label>
                        <input
                          type="text"
                          placeholder={
                            currentUser
                              ? `Mặc định: ${currentUser.name}`
                              : "VD: Bố Lâm, Con trai Minh..."
                          }
                          value={joinUserName}
                          onChange={(e) => setJoinUserName(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Vai Trò Bạn Muốn Tham Gia</label>
                        <div className="role-picker">
                          <div
                            className={`role-card-opt ${joinUserRole === "parent" ? "selected" : ""}`}
                            onClick={() => setJoinUserRole("parent")}
                          >
                            <span className="role-icon-sim">🐻</span>
                            <span className="role-title-sim">Cha Mẹ</span>
                          </div>
                          <div
                            className={`role-card-opt ${joinUserRole === "child" ? "selected" : ""}`}
                            onClick={() => setJoinUserRole("child")}
                          >
                            <span className="role-icon-sim">🐰</span>
                            <span className="role-title-sim">Con Cái</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn btn-secondary"
                        style={{ width: "100%" }}
                      >
                        Tham Gia Phòng Đối Thoại
                      </button>
                    </form>
                  </div>
                )}

                {/* 3. PHÒNG ĐÃ LƯU (Luôn hiển thị bên dưới rất tiện lợi) */}
                <div
                  className="card animate-fade"
                  style={{ marginTop: "24px" }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      marginBottom: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    ⭐️ Phòng Đang Liên Kết Của Tôi
                  </h3>
                  {savedRoomIds.length === 0 ? (
                    <p
                      style={{
                        fontStyle: "italic",
                        color: "var(--text-muted)",
                        fontSize: "13.5px",
                      }}
                    >
                      Bạn chưa lưu hoặc tham gia phòng nào gần đây. Hãy tạo hoặc
                      kết nối để lưu giữ lịch sử.
                    </p>
                  ) : (
                    <div className="saved-rooms-list">
                      {savedRoomIds.map((id) => {
                        const r = rooms.find((room) => room.id === id);
                        if (!r) return null;
                        return (
                          <div className="saved-room-card" key={r.id}>
                            <div className="room-meta-info">
                              <span className="room-meta-name">{r.name}</span>
                              <span className="room-meta-details">
                                ID: {r.id} | Trạng thái:{" "}
                                {r.status === "waiting"
                                  ? "Đang đợi kết nối"
                                  : r.status === "quiz"
                                    ? "Làm bài kiểm tra"
                                    : r.status === "review"
                                      ? "AI đang nhận xét"
                                      : "Đã hoàn thành"}
                              </span>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleQuickJoinSavedRoom(r)}
                              >
                                Kết Nối
                              </button>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => toggleBookmarkRoom(r.id)}
                                style={{ padding: "8px", minWidth: "36px" }}
                                title="Xóa khỏi danh sách lưu"
                              >
                                ❌
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ====================================================================
            2. VIEW EXPLAIN MECHANISM (GIẢI THÍCH CƠ CHẾ)
            ==================================================================== */}
        {currentView === "mechanism" && (
          <div className="container-narrow animate-slide">
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2 style={{ fontSize: "32px", marginBottom: "12px" }}>
                Hướng Dẫn Kết Nối Của "Hiểu Nhau"
              </h2>
              <p style={{ color: "var(--text-muted)" }}>
                Quy trình thấu cảm 5 bước tinh gọn giúp gia đình nhanh chóng kết
                nối và thấu hiểu.
              </p>
            </div>

            <div className="steps-container">
              <div className="step-row">
                <div className="step-num-circle">1</div>
                <div className="step-card-content">
                  <h3>Tạo Không Gian</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "14.5px" }}>
                    Tạo phòng với ID và mật khẩu để đảm bảo không gian đối thoại
                    gia đình riêng tư, an toàn.
                  </p>
                </div>
              </div>

              <div className="step-row">
                <div className="step-num-circle">2</div>
                <div className="step-card-content">
                  <h3>Chọn Vai Trò</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "14.5px" }}>
                    Một người làm Cha mẹ, một người làm Con cái để cùng bắt đầu
                    kết nối.
                  </p>
                </div>
              </div>

              <div className="step-row">
                <div className="step-num-circle">3</div>
                <div className="step-card-content">
                  <h3>Đặt Câu Hỏi Riêng Tư</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "14.5px" }}>
                    Tự do soạn những câu hỏi hoặc chọn từ gợi ý. Nội dung được
                    giữ kín hoàn toàn đến lúc làm bài.
                  </p>
                </div>
              </div>

              <div className="step-row">
                <div className="step-num-circle">4</div>
                <div className="step-card-content">
                  <h3>Cùng Làm Bài Test</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "14.5px" }}>
                    Hệ thống gộp câu hỏi của cả hai. Mỗi người độc lập trả lời
                    và chọn cảm xúc thực tế.
                  </p>
                </div>
              </div>

              <div className="step-row">
                <div className="step-num-circle">5</div>
                <div className="step-card-content">
                  <h3>Xem Kết Quả Tổng Hợp</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "14.5px" }}>
                    Cùng xem kết quả tổng hợp các phản hồi để thấu hiểu nhau
                    hơn.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <button
                className="btn btn-primary"
                onClick={() => navigateTo("home")}
              >
                Đã xem hướng dẫn, Tạo phòng kết nối ngay!
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            3. VIEW AI EXPLANATION (TÍCH HỢP AI NHƯ THẾ NÀO)
            ==================================================================== */}
        {currentView === "ai-info" && (
          <div className="animate-slide">
            <div
              style={{
                textAlign: "center",
                marginBottom: "40px",
                maxWidth: "800px",
                margin: "0 auto 40px",
              }}
            >
              <h2 style={{ fontSize: "32px", marginBottom: "12px" }}>
                Công Nghệ AI Thấu Cảm Không Chỉ Trích
              </h2>
              <p style={{ color: "var(--text-muted)" }}>
                Điểm cốt lõi của "Hiểu Nhau" là mô hình ngôn ngữ lớn được tinh
                chỉnh riêng về tâm lý gia đình. AI đóng vai trò như một chuyên
                gia hòa giải trung lập, thấu cảm và ấm áp.
              </p>
            </div>

            <div className="features-grid">
              <div className="card">
                <div
                  className="card-icon"
                  style={{
                    backgroundColor: "rgba(129, 178, 154, 0.12)",
                    color: "var(--accent)",
                  }}
                >
                  🤝
                </div>
                <h3 className="card-title">
                  Phân Tích Đưa Ra Lời Khuyên Chân Thành
                </h3>
                <p className="card-desc">
                  AI của chúng tôi phân tích cặn kẽ cảm xúc và hoàn cảnh để đưa
                  ra những lời khuyên chân thành nhất. AI hiểu rằng cha mẹ muốn
                  bảo vệ con khỏi tổn thương, còn con cái muốn chứng tỏ bản thân
                  tự lập. AI sẽ tìm kiếm động cơ yêu thương phía sau mỗi câu nói
                  để làm dịu xung đột.
                </p>
              </div>

              <div className="card">
                <div
                  className="card-icon"
                  style={{
                    backgroundColor: "rgba(224, 122, 95, 0.12)",
                    color: "var(--primary)",
                  }}
                >
                  🎭
                </div>
                <h3 className="card-title">Phân Tích Cảm Xúc 4 Chiều</h3>
                <p className="card-desc">
                  Bằng cách tích hợp biểu tượng cảm xúc (Vui vẻ, lo lắng, hy
                  vọng, áp lực) vào câu trả lời, hệ thống nhận diện và phản hồi
                  cảm xúc một cách nhẹ nhàng và thực tế.
                </p>
              </div>

              <div className="card">
                <div
                  className="card-icon"
                  style={{
                    backgroundColor: "rgba(61, 90, 128, 0.12)",
                    color: "var(--secondary)",
                  }}
                >
                  📋
                </div>
                <h3 className="card-title">Hành Động Nhỏ, Thay Đổi Lớn</h3>
                <p className="card-desc">
                  Thay vì những lý thuyết sáo rỗng, AI đúc kết thành các câu
                  thoại mẫu cụ thể để cha mẹ và con cái áp dụng trực tiếp vào
                  bữa ăn hay buổi trò chuyện hàng ngày.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            4. VIEW ABOUT US (VỀ CHÚNG TÔI)
            ==================================================================== */}
        {currentView === "about" && (
          <div className="container-narrow animate-slide">
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2 style={{ fontSize: "32px", marginBottom: "12px" }}>
                Về Dự Án "Hiểu Nhau"
              </h2>
              <p style={{ color: "var(--text-muted)" }}>
                Hàn gắn rạn nứt thế hệ bằng công nghệ thấu cảm.
              </p>
            </div>

            <div className="card" style={{ marginBottom: "30px" }}>
              <h3 style={{ fontSize: "22px", marginBottom: "12px" }}>
                Sứ Mệnh Của Chúng Tôi
              </h3>
              <p
                style={{
                  color: "var(--text-main)",
                  fontSize: "15px",
                  marginBottom: "16px",
                }}
              >
                Xã hội hiện đại với sự bùng nổ của mạng xã hội vô tình kéo dãn
                khoảng cách giữa cha mẹ và con cái. Sự khác biệt về hệ giá trị
                sống và cách thức giao tiếp dẫn đến những hiểu lầm tích tụ thành
                rào cản im lặng.
              </p>
              <p style={{ color: "var(--text-main)", fontSize: "15px" }}>
                Chúng tôi tin rằng, cốt lõi của sự gắn kết không phải là việc áp
                đặt một chuẩn mực hoàn hảo, mà là xây dựng một cầu nối giao tiếp
                an toàn, nơi cả phụ huynh và học sinh đều cảm thấy tiếng nói của
                mình được lắng nghe, được trân trọng mà không lo sợ bị phán xét.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: "22px", marginBottom: "12px" }}>
                Đội Ngũ Sáng Tạo
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "14.5px",
                  marginBottom: "16px",
                }}
              >
                Dự án "Hiểu Nhau" được lập trình và phát triển bởi các kỹ sư
                công nghệ nhiệt huyết phối hợp với các cố vấn tâm lý học hành vi
                gia đình Việt Nam. Chúng tôi hy vọng ứng dụng này sẽ là người
                bạn đồng hành ấm áp trong mỗi mái nhà.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  textAlign: "center",
                  marginTop: "20px",
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    background: "var(--accent-warm)",
                    borderRadius: "12px",
                  }}
                >
                  <span style={{ fontSize: "28px" }}>🤖</span>
                  <h4 style={{ fontSize: "16px", marginTop: "6px" }}>
                    Đội Ngũ AI
                  </h4>
                  <span
                    style={{ fontSize: "12px", color: "var(--text-muted)" }}
                  >
                    Tinh chỉnh mô hình tâm lý thấu cảm
                  </span>
                </div>
                <div
                  style={{
                    padding: "16px",
                    background: "var(--accent-warm)",
                    borderRadius: "12px",
                  }}
                >
                  <span style={{ fontSize: "28px" }}>❤️</span>
                  <h4 style={{ fontSize: "16px", marginTop: "6px" }}>
                    Nhà Tâm Lý Học
                  </h4>
                  <span
                    style={{ fontSize: "12px", color: "var(--text-muted)" }}
                  >
                    Xây dựng kịch bản & quy trình kết nối
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            5. VIEW CONTACT (LIÊN HỆ)
            ==================================================================== */}
        {currentView === "contact" && (
          <div className="container-narrow animate-slide">
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2 style={{ fontSize: "32px", marginBottom: "12px" }}>
                Gửi Lời Nhắn Yêu Thương
              </h2>
              <p style={{ color: "var(--text-muted)" }}>
                Nếu bạn có bất kỳ thắc mắc, đóng góp ý kiến hay muốn chia sẻ câu
                chuyện gắn kết gia đình của mình, hãy viết thư cho chúng tôi
                nhé!
              </p>
            </div>

            {contactSuccess && (
              <div
                style={{
                  backgroundColor: "#D4EFDF",
                  color: "#196F3D",
                  padding: "18px",
                  borderRadius: "16px",
                  marginBottom: "24px",
                  fontWeight: "600",
                  border: "1.5px solid #A9DFBF",
                  textAlign: "center",
                }}
              >
                🌸 {contactSuccess}
              </div>
            )}

            <div className="card">
              <form onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label>Tên của bạn</label>
                  <input
                    type="text"
                    placeholder="Nhập tên hiển thị"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Địa chỉ Email của bạn</label>
                  <input
                    type="email"
                    placeholder="VD: name@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Lời nhắn / Chia sẻ tâm sự</label>
                  <textarea
                    rows="5"
                    placeholder="Nhập nội dung chia sẻ hoặc thắc mắc của bạn..."
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                >
                  Gửi Đi Lời Chia Sẻ
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================================
            6. VIEW AUTH: LOGIN (ĐĂNG NHẬP)
            ==================================================================== */}
        {currentView === "login" && (
          <div className="container-mobile animate-slide">
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h2 style={{ fontSize: "28px", marginBottom: "8px" }}>
                Chào Mừng Trở Lại
              </h2>
              <p style={{ color: "var(--text-muted)" }}>
                Đăng nhập để xem danh sách phòng kết nối đã lưu của bạn.
              </p>
            </div>

            {authError && (
              <div
                style={{
                  backgroundColor: "#FADBD8",
                  color: "#78281F",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  fontWeight: "600",
                  border: "1px solid #F5B7B1",
                  fontSize: "14px",
                }}
              >
                ⚠️ {authError}
              </div>
            )}

            <div className="card">
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Địa chỉ Email</label>
                  <input
                    type="email"
                    placeholder="VD: name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mật Khẩu</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu tài khoản"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      style={{ paddingRight: "48px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        fontSize: "18px",
                        cursor: "pointer",
                        padding: "4px",
                        lineHeight: 1,
                      }}
                      title={showLoginPassword ? "Ẩn mật khẩu" : "Xem mật khẩu"}
                    >
                      {showLoginPassword ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", marginBottom: "16px" }}
                >
                  Đăng Nhập Hệ Thống
                </button>
              </form>

              <div
                style={{
                  textAlign: "center",
                  fontSize: "14px",
                  color: "var(--text-muted)",
                }}
              >
                Chưa có tài khoản?{" "}
                <a
                  onClick={() => navigateTo("register")}
                  style={{
                    color: "var(--primary)",
                    fontWeight: "600",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Đăng ký ngay
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            7. VIEW AUTH: REGISTER (ĐĂNG KÝ)
            ==================================================================== */}
        {currentView === "register" && (
          <div className="container-mobile animate-slide">
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h2 style={{ fontSize: "28px", marginBottom: "8px" }}>
                Tạo Tài Khoản Mới
              </h2>
              <p style={{ color: "var(--text-muted)" }}>
                Đăng ký tài khoản để ghi nhớ lịch sử thấu cảm của gia đình.
              </p>
            </div>

            {authError && (
              <div
                style={{
                  backgroundColor: "#FADBD8",
                  color: "#78281F",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  fontWeight: "600",
                  border: "1px solid #F5B7B1",
                  fontSize: "14px",
                }}
              >
                ⚠️ {authError}
              </div>
            )}

            {authSuccess && (
              <div
                style={{
                  backgroundColor: "#D4EFDF",
                  color: "#196F3D",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  fontWeight: "600",
                  border: "1px solid #A9DFBF",
                  fontSize: "14px",
                }}
              >
                🌸 {authSuccess}
              </div>
            )}

            <div className="card">
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Họ và Tên</label>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên hiển thị"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Địa chỉ Email</label>
                  <input
                    type="email"
                    placeholder="VD: name@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mật Khẩu Mới</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Tối thiểu 6 ký tự bảo mật"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      style={{ paddingRight: "48px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        fontSize: "18px",
                        cursor: "pointer",
                        padding: "4px",
                        lineHeight: 1,
                      }}
                      title={showRegPassword ? "Ẩn mật khẩu" : "Xem mật khẩu"}
                    >
                      {showRegPassword ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", marginBottom: "16px" }}
                >
                  Đăng Ký Tài Khoản
                </button>
              </form>

              <div
                style={{
                  textAlign: "center",
                  fontSize: "14px",
                  color: "var(--text-muted)",
                }}
              >
                Đã có tài khoản rồi?{" "}
                <a
                  onClick={() => navigateTo("login")}
                  style={{
                    color: "var(--primary)",
                    fontWeight: "600",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Đăng nhập
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            7.5. VIEW AUTH: PROFILE MANAGEMENT (QUẢN LÝ TÀI KHOẢN)
            ==================================================================== */}
        {currentView === "profile" && currentUser && (
          <div className="container-mobile animate-slide">
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h2 style={{ fontSize: "28px", marginBottom: "8px" }}>
                Quản Lý Tài Khoản
              </h2>
              <p style={{ color: "var(--text-muted)" }}>
                Chỉnh sửa thông tin cá nhân tùy chọn bên dưới.
              </p>
            </div>

            {profileError && (
              <div
                style={{
                  backgroundColor: "#FADBD8",
                  color: "#78281F",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  fontWeight: "600",
                  border: "1px solid #F5B7B1",
                  fontSize: "14px",
                }}
              >
                ⚠️ {profileError}
              </div>
            )}

            {profileSuccess && (
              <div
                style={{
                  backgroundColor: "#D4EFDF",
                  color: "#196F3D",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  fontWeight: "600",
                  border: "1px solid #A9DFBF",
                  fontSize: "14px",
                }}
              >
                🌸 {profileSuccess}
              </div>
            )}

            <div className="card">
              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label>
                    Họ và Tên <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên hiển thị"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      fontWeight: "700",
                      display: "block",
                      marginBottom: "10px",
                    }}
                  >
                    Ảnh Đại Diện Của Bạn
                  </label>

                  {/* Current Avatar Display */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        backgroundColor:
                          currentUser.avatarColor || "var(--primary)",
                        border: "3px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "36px",
                        overflow: "hidden",
                        boxShadow: "var(--shadow)",
                        flexShrink: 0,
                      }}
                    >
                      {profileAvatar &&
                      (profileAvatar.startsWith("data:image") ||
                        profileAvatar.startsWith("http") ||
                        profileAvatar.startsWith("https")) ? (
                        <img
                          src={profileAvatar}
                          alt="preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span>{profileAvatar || "🦊"}</span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--text-muted)",
                          display: "block",
                          lineHeight: 1.4,
                        }}
                      >
                        Chọn Mascot con vật hoạt hình đáng yêu bên dưới để làm
                        ảnh hồ sơ đại diện của bạn.
                      </span>
                    </div>
                  </div>

                  {/* Preset Mascots */}
                  <div style={{ marginBottom: "8px" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "var(--secondary)",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      🦁 Chọn Mascot Hoạt Hình:
                    </span>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        padding: "8px",
                        backgroundColor: "rgba(140, 98, 57, 0.05)",
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
                        justifyContent: "center",
                      }}
                    >
                      {MASCOTS.map((m, i) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setProfileAvatar(m);
                            setProfileAvatarMascotName(MASCOT_NAMES[i]);
                          }}
                          style={{
                            fontSize: "20px",
                            background:
                              profileAvatar === m
                                ? "var(--primary-light)"
                                : "none",
                            border:
                              profileAvatar === m
                                ? "2px solid var(--primary)"
                                : "2px solid transparent",
                            borderRadius: "50%",
                            width: "38px",
                            height: "38px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s ease",
                            boxShadow:
                              profileAvatar === m
                                ? "0 2px 8px rgba(0,0,0,0.1)"
                                : "none",
                            padding: 0,
                          }}
                          title={MASCOT_NAMES[i]}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Tuổi (Không bắt buộc)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="VD: 16, 45 (Không bắt buộc)"
                    value={profileAge}
                    onChange={(e) => setProfileAge(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Giới Tính (Không bắt buộc)</label>
                  <select
                    value={profileGender}
                    onChange={(e) => setProfileGender(e.target.value)}
                  >
                    <option value="">-- Chưa chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Ngày Sinh (Không bắt buộc)</label>
                  <input
                    type="date"
                    value={profileBirthday}
                    onChange={(e) => setProfileBirthday(e.target.value)}
                  />
                </div>

                {profileSavedPassword && (
                  <div className="form-group">
                    <label>Mật Khẩu Đã Lưu</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showSavedPassword ? "text" : "password"}
                        value={profileSavedPassword}
                        readOnly
                        style={{
                          paddingRight: "48px",
                          backgroundColor: "rgba(0,0,0,0.03)",
                          color: "var(--text-muted)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSavedPassword(!showSavedPassword)}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          fontSize: "18px",
                          cursor: "pointer",
                          padding: "4px",
                          lineHeight: 1,
                        }}
                        title={
                          showSavedPassword ? "Ẩn mật khẩu" : "Xem mật khẩu"
                        }
                      >
                        {showSavedPassword ? "👁️" : "🙈"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Mật Khẩu Mới (Bỏ trống nếu không đổi)</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showProfilePassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu mới"
                      value={profilePassword}
                      onChange={(e) => setProfilePassword(e.target.value)}
                      style={{ paddingRight: "48px" }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowProfilePassword(!showProfilePassword)
                      }
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        fontSize: "18px",
                        cursor: "pointer",
                        padding: "4px",
                        lineHeight: 1,
                      }}
                      title={
                        showProfilePassword ? "Ẩn mật khẩu" : "Xem mật khẩu"
                      }
                    >
                      {showProfilePassword ? "👁️" : "🙈"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", marginBottom: "14px" }}
                >
                  Lưu Thay Đổi
                </button>
              </form>

              <hr
                style={{
                  border: "none",
                  borderTop: "2px solid var(--border)",
                  margin: "20px 0",
                }}
              />

              <button
                type="button"
                className="btn"
                onClick={handleLogout}
                style={{
                  width: "100%",
                  backgroundColor: "#E63946",
                  color: "white",
                  marginBottom: "14px",
                }}
              >
                🚪 Đăng Xuất Tài Khoản
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigateTo("home")}
                style={{ width: "100%" }}
              >
                Quay Về Trang Chủ
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            7.8. VIEW KẾT LUẬN ĐÃ LƯU (SAVED EMPATHY ARCHIVE)
            ==================================================================== */}
        {currentView === "saved-conclusions" && currentUser && (
          <div className="animate-slide">
            <div style={{ textAlign: "center", marginBottom: "35px" }}>
              <h2 style={{ fontSize: "28px", marginBottom: "8px" }}>
                📖 Kho Tư Liệu Kết Luận
              </h2>
              <p
                style={{
                  color: "var(--text-muted)",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                Nơi lưu trữ những báo cáo thấu hiểu, lời khuyên ứng xử từ trợ lý
                AI và chỉ số gắn kết qua từng chặng đường gia đình bạn đã đi
                qua.
              </p>
            </div>

            {(() => {
              const mySaved = savedConclusions.filter(
                (c) => c.userEmail === currentUser.email.toLowerCase(),
              );

              if (mySaved.length === 0) {
                return (
                  <div
                    className="card"
                    style={{
                      textAlign: "center",
                      padding: "40px 24px",
                      maxWidth: "500px",
                      margin: "0 auto",
                    }}
                  >
                    <div style={{ fontSize: "56px", marginBottom: "20px" }}>
                      📖
                    </div>
                    <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>
                      Chưa có báo cáo nào được lưu
                    </h3>
                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "14px",
                        lineHeight: 1.6,
                        marginBottom: "24px",
                      }}
                    >
                      Sau khi bạn và người thân hoàn thành tất cả các câu hỏi
                      trong phòng kết nối, hãy bấm nút{" "}
                      <strong>"Lưu Kết Luận Thấu Hiểu"</strong> ở trang kết quả
                      để lưu giữ vĩnh viễn tư liệu quý giá này tại đây!
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigateTo("home")}
                    >
                      Quay Lại Trang Chủ
                    </button>
                  </div>
                );
              }

              return (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "20px",
                    marginBottom: "40px",
                  }}
                >
                  {mySaved.map((c) => (
                    <div
                      key={c.id}
                      className="card"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        border: "2px solid var(--border)",
                        borderRadius: "20px",
                        padding: "24px",
                        position: "relative",
                        boxShadow: "var(--shadow)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <div>
                        {/* Card Header metadata */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "16px",
                          }}
                        >
                          <span
                            style={{
                              backgroundColor: "rgba(140, 98, 57, 0.1)",
                              color: "var(--secondary)",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "11.5px",
                              fontWeight: "700",
                            }}
                          >
                            {c.roomName}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--text-muted)",
                            }}
                          >
                            {new Date(c.savedAt).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Middle info */}
                        <div
                          style={{
                            display: "flex",
                            gap: "16px",
                            alignItems: "center",
                            marginBottom: "20px",
                          }}
                        >
                          <div
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "50%",
                              backgroundColor: "var(--primary)",
                              color: "white",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "800",
                              fontSize: "15px",
                              boxShadow: "var(--shadow)",
                              flexShrink: 0,
                            }}
                          >
                            <span>{c.score}%</span>
                            <span
                              style={{
                                fontSize: "7px",
                                fontWeight: "500",
                                textTransform: "uppercase",
                              }}
                            >
                              Thấu hiểu
                            </span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4
                              style={{
                                fontSize: "16px",
                                fontWeight: "800",
                                margin: "0 0 4px 0",
                              }}
                            >
                              Báo Cáo Thấu Hiểu AI
                            </h4>
                            <p
                              style={{
                                fontSize: "12.5px",
                                color: "var(--text-muted)",
                                margin: 0,
                              }}
                            >
                              🐻{" "}
                              {c.creatorRole === "parent"
                                ? c.creatorName
                                : c.joinerName}{" "}
                              & 🐰{" "}
                              {c.creatorRole === "child"
                                ? c.creatorName
                                : c.joinerName}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "10px",
                        }}
                      >
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setActiveViewedConclusion(c)}
                          style={{ flex: 1, padding: "10px", fontSize: "13px" }}
                        >
                          📖 Xem Chi Tiết
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() =>
                            handleShare(
                              `Báo cáo thấu hiểu: ${c.roomName}`,
                              `Chúng tôi đã đạt được ${c.score}% thấu hiểu trên ứng dụng Hiểu Nhau. Hãy cùng gia đình bạn thử nhé!`,
                            )
                          }
                          style={{ padding: "10px", fontSize: "13px" }}
                          title="Chia sẻ kết quả"
                        >
                          🔗
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Bạn có chắc chắn muốn xóa báo cáo của phòng "${c.roomName}" khỏi danh mục lưu trữ?`,
                              )
                            ) {
                              handleDeleteConclusion(c.id);
                            }
                          }}
                          style={{
                            padding: "10px",
                            fontSize: "13px",
                            backgroundColor: "rgba(230, 57, 70, 0.1)",
                            color: "#E63946",
                            border: "1.5px solid rgba(230, 57, 70, 0.2)",
                          }}
                          title="Xóa báo cáo"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ====================================================================
            NHẬT KÝ CẢM XÚC (EMOTION DIARY)
            ==================================================================== */}
        {currentView === "emotion-diary" && currentUser && (
          <div className="animate-slide">
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h2 style={{ fontSize: "28px", marginBottom: "12px" }}>
                Nhật Ký Cảm Xúc
              </h2>
              <p style={{ color: "var(--text-muted)" }}>
                Hôm nay bạn cảm thấy thế nào? Ghi lại cảm xúc giúp bạn thấu hiểu
                bản thân hơn.
              </p>
            </div>

            <div
              className="card"
              style={{ marginBottom: "30px", textAlign: "center" }}
            >
              <h3 style={{ marginBottom: "20px" }}>Bạn đang cảm thấy...</h3>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {[
                  { id: "happy", icon: "😊", label: "Vui vẻ" },
                  { id: "normal", icon: "😐", label: "Bình thường" },
                  { id: "stressed", icon: "😣", label: "Áp lực" },
                  { id: "sad", icon: "😢", label: "Buồn" },
                  { id: "angry", icon: "😡", label: "Tức giận" },
                ].map((emo) => (
                  <button
                    key={emo.id}
                    className="btn btn-secondary"
                    style={{
                      padding: "16px",
                      fontSize: "16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      minWidth: "100px",
                    }}
                    onClick={() => {
                      const newLog = {
                        date: new Date().toISOString().split("T")[0],
                        emotion: emo.id,
                        label: emo.label,
                        icon: emo.icon,
                      };
                      const existingIndex = emotionLogs.findIndex(
                        (log) => log.date === newLog.date,
                      );
                      let newLogs = [...emotionLogs];
                      if (existingIndex !== -1) {
                        newLogs[existingIndex] = newLog;
                      } else {
                        newLogs.push(newLog);
                      }
                      setEmotionLogs(newLogs);
                      localStorage.setItem(
                        "HN_emotion_logs",
                        JSON.stringify(newLogs),
                      );
                      syncUserDataToAPI({ emotionLogs: newLogs });
                      setAuthAlertTitle("Nhật Ký Cảm Xúc");
                      setAuthAlertMessage(
                        `Đã lưu cảm xúc: ${emo.label}. ${emo.id === "stressed" || emo.id === "sad" || emo.id === "angry" ? "Mọi chuyện rồi sẽ ổn thôi, hãy dành chút thời gian nghỉ ngơi nhé!" : "Tuyệt vời, chúc bạn một ngày tốt lành!"}`,
                      );
                      setAuthAlertIcon(emo.icon);
                      setAuthAlertRedirect(null);
                      setShowAuthAlertModal(true);
                    }}
                  >
                    <span style={{ fontSize: "32px" }}>{emo.icon}</span>
                    <span>{emo.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: "20px" }}>
                Xu Hướng Cảm Xúc (7 Ngày Qua)
              </h3>
              {emotionLogs.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    overflowX: "auto",
                    paddingBottom: "10px",
                  }}
                >
                  {[...emotionLogs]
                    .reverse()
                    .slice(0, 7)
                    .map((log, idx) => (
                      <div
                        key={idx}
                        style={{
                          minWidth: "80px",
                          textAlign: "center",
                          padding: "12px",
                          backgroundColor: "var(--bg)",
                          borderRadius: "12px",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            marginBottom: "8px",
                          }}
                        >
                          {log.date}
                        </div>
                        <div style={{ fontSize: "28px" }}>{log.icon}</div>
                        <div
                          style={{
                            fontSize: "12px",
                            marginTop: "8px",
                            fontWeight: "600",
                          }}
                        >
                          {log.label}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)", textAlign: "center" }}>
                  Chưa có dữ liệu cảm xúc. Hãy ghi lại cảm xúc đầu tiên của bạn
                  nhé!
                </p>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================
            THỬ THÁCH GIAO TIẾP (7 NGÀY)
            ==================================================================== */}
        {currentView === "challenge" && currentUser && (
          <div className="animate-slide">
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h2 style={{ fontSize: "28px", marginBottom: "12px" }}>
                Thử Thách 7 Ngày: Kết Nối Cùng Nhau
              </h2>
              <p style={{ color: "var(--text-muted)" }}>
                Nhiệm vụ nhỏ mỗi ngày giúp cải thiện giao tiếp gia đình.
              </p>
            </div>

            <div className="card" style={{ marginBottom: "30px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ margin: 0 }}>Tiến Độ Thử Thách</h3>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() =>
                    handleShare(
                      "Thử Thách 7 Ngày - Hiểu Nhau",
                      "Tôi đang tham gia thử thách kết nối gia đình 7 ngày trên Hiểu Nhau. Bạn cùng tham gia nhé!",
                    )
                  }
                >
                  🔗 Chia sẻ kết quả
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  paddingBottom: "10px",
                  justifyContent: "center",
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div
                    key={day}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: challengeProgress.includes(day)
                        ? "var(--primary)"
                        : "var(--bg)",
                      color: challengeProgress.includes(day)
                        ? "white"
                        : "var(--text)",
                      border: `2px solid ${challengeProgress.includes(day) ? "var(--primary)" : "var(--border)"}`,
                      fontWeight: "bold",
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="card"
              style={{ textAlign: "center", padding: "40px 20px" }}
            >
              {challengeProgress.length >= 7 ? (
                <>
                  <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                    🏆
                  </div>
                  <h3 style={{ fontSize: "24px", marginBottom: "16px" }}>
                    Chúc mừng bạn đã hoàn thành 7 Ngày Thử Thách!
                  </h3>
                  <p
                    style={{ color: "var(--text-muted)", marginBottom: "20px" }}
                  >
                    Hy vọng sự gắn kết trong gia đình bạn đã được cải thiện đáng
                    kể.
                  </p>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setChallengeProgress([]);
                      setLastChallengeDate("");
                      localStorage.setItem("HN_challenge_progress", "[]");
                      localStorage.removeItem("HN_last_challenge_date");
                    }}
                  >
                    Bắt đầu lại thử thách
                  </button>
                </>
              ) : lastChallengeDate ===
                new Date().toISOString().split("T")[0] ? (
                <>
                  <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                    ⏳
                  </div>
                  <h3 style={{ fontSize: "24px", marginBottom: "16px" }}>
                    Bạn đã hoàn thành nhiệm vụ hôm nay!
                  </h3>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      marginBottom: "20px",
                      fontSize: "16px",
                    }}
                  >
                    Hãy nghỉ ngơi và quay lại vào ngày mai nhé. Thử thách tiếp
                    theo sẽ mở khóa sau:
                  </p>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: "bold",
                      color: "var(--primary)",
                      fontFamily: "monospace",
                      padding: "10px",
                      backgroundColor: "var(--accent-light)",
                      borderRadius: "12px",
                      display: "inline-block",
                    }}
                  >
                    {timeUntilMidnight || "00:00:00"}
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "var(--primary)",
                      fontWeight: "700",
                      marginBottom: "12px",
                      textTransform: "uppercase",
                    }}
                  >
                    Nhiệm vụ Ngày {challengeProgress.length + 1}
                  </div>
                  <h3
                    style={{
                      fontSize: "22px",
                      marginBottom: "30px",
                      lineHeight: "1.5",
                    }}
                  >
                    {
                      [
                        "Hỏi người thân điều gì khiến họ cảm thấy áp lực nhất dạo gần đây.",
                        "Dành 15 phút lắng nghe trọn vẹn mà không ngắt lời hay phán xét.",
                        "Nói một lời cảm ơn chân thành về một điều nhỏ bé người kia đã làm.",
                        "Cùng nhau chia sẻ một kỉ niệm vui trong quá khứ.",
                        "Hỏi ý kiến người thân về một quyết định nhỏ trong ngày.",
                        "Viết một tờ giấy nhắn yêu thương và để ở nơi dễ thấy.",
                        "Ôm người thân một cái thật chặt thay cho lời chào buổi sáng.",
                      ][challengeProgress.length]
                    }
                  </h3>
                  <button
                    className="btn btn-primary"
                    style={{ padding: "14px 32px", fontSize: "16px" }}
                    onClick={() => {
                      const todayStr = new Date().toISOString().split("T")[0];
                      const nextDay = challengeProgress.length + 1;
                      const newProgress = [...challengeProgress, nextDay];
                      setChallengeProgress(newProgress);
                      setLastChallengeDate(todayStr);
                      localStorage.setItem(
                        "HN_challenge_progress",
                        JSON.stringify(newProgress),
                      );
                      localStorage.setItem("HN_last_challenge_date", todayStr);
                      syncUserDataToAPI({ challengeProgress: newProgress });
                      setAuthAlertTitle("Thử Thách 7 Ngày");
                      setAuthAlertMessage(
                        "Tuyệt vời! Bạn đã hoàn thành nhiệm vụ ngày hôm nay. Hãy duy trì thói quen này nhé!",
                      );
                      setAuthAlertIcon("✨");
                      setAuthAlertRedirect(null);
                      setShowAuthAlertModal(true);
                    }}
                  >
                    Đã Hoàn Thành ✨
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================
            TÀI NGUYÊN (RESOURCES)
            ==================================================================== */}
        {currentView === "resources" && (
          <div className="animate-slide">
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2 style={{ fontSize: "32px", marginBottom: "12px" }}>
                Tài Nguyên Hữu Ích
              </h2>
              <p style={{ color: "var(--text-muted)" }}>
                Kiến thức tâm lý và kỹ năng giao tiếp giúp xây dựng gia đình
                hạnh phúc.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "24px",
              }}
            >
              <div className="card">
                <h3
                  style={{
                    borderBottom: "2px solid var(--border)",
                    paddingBottom: "12px",
                    marginBottom: "16px",
                  }}
                >
                  📄 Bài viết hữu ích
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li>
                    <a
                      href="#"
                      style={{
                        color: "var(--primary)",
                        textDecoration: "none",
                        fontWeight: "600",
                      }}
                    >
                      5 cách lắng nghe thấu cảm con cái tuổi dậy thì
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      style={{
                        color: "var(--primary)",
                        textDecoration: "none",
                        fontWeight: "600",
                      }}
                    >
                      Làm sao để cha mẹ hiểu được áp lực học tập của con?
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      style={{
                        color: "var(--primary)",
                        textDecoration: "none",
                        fontWeight: "600",
                      }}
                    >
                      Kiểm soát cảm xúc khi xảy ra xung đột gia đình
                    </a>
                  </li>
                </ul>
              </div>

              <div className="card">
                <h3
                  style={{
                    borderBottom: "2px solid var(--border)",
                    paddingBottom: "12px",
                    marginBottom: "16px",
                  }}
                >
                  🎥 Video hướng dẫn
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li>
                    <a
                      href="#"
                      style={{
                        color: "var(--primary)",
                        textDecoration: "none",
                        fontWeight: "600",
                      }}
                    >
                      [Video] Đóng vai: Phản ứng đúng và sai khi con điểm kém
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      style={{
                        color: "var(--primary)",
                        textDecoration: "none",
                        fontWeight: "600",
                      }}
                    >
                      [Video] Cách nói chuyện để trẻ tự mở lời
                    </a>
                  </li>
                </ul>
              </div>

              <div className="card">
                <h3
                  style={{
                    borderBottom: "2px solid var(--border)",
                    paddingBottom: "12px",
                    marginBottom: "16px",
                  }}
                >
                  ❓ Câu hỏi thường gặp
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <li>
                    <strong>
                      Q: Tôi nên làm gì khi con không chịu nói chuyện?
                    </strong>
                    <br />
                    <span
                      style={{ fontSize: "14px", color: "var(--text-muted)" }}
                    >
                      A: Đừng ép buộc, hãy bắt đầu bằng việc ở bên cạnh và chia
                      sẻ trước về một ngày của bạn...
                    </span>
                  </li>
                  <li>
                    <strong>
                      Q: Cãi vã nhiều có nghĩa là gia đình bất hạnh?
                    </strong>
                    <br />
                    <span
                      style={{ fontSize: "14px", color: "var(--text-muted)" }}
                    >
                      A: Không, cãi vã là quá trình đi tìm tiếng nói chung nếu
                      biết cách tranh luận lành mạnh...
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            8. ACTIVE INTERACTIVE ROOM (KHÔNG GIAN PHÒNG ĐỒNG BỘ CHÍNH)
            ==================================================================== */}
        {currentView === "room" && activeRoom && (
          <div className="animate-slide">
            {/* THÔNG TIN CHUNG VÀ TRẠNG THÁI HIỆN DIỆN CỦA PHÒNG KẾT NỐI */}
            <div className="room-header-status">
              <div className="room-meta-group">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleLeaveRoom}
                  style={{ padding: "8px 12px" }}
                >
                  ⬅ Rời Phòng
                </button>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h3
                    style={{
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    Phòng: {activeRoom.name}
                  </h3>
                  <span
                    style={{ fontSize: "12px", color: "var(--text-muted)" }}
                  >
                    Mã tham gia: <strong>{activeRoom.id}</strong> (Mật khẩu:{" "}
                    {activeRoom.password})
                  </span>
                </div>
              </div>

              {/* Status members presence */}
              {/* Status members presence */}
              <div
                className="member-presence-bar"
                style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
              >
                {activeRoom.members.map((m, idx) => (
                  <div
                    key={idx}
                    className={`member-badge-indicator ${m.finished ? "online" : "offline"}`}
                    style={{ opacity: 1 }}
                  >
                    <span>{m.role === "parent" ? "🐻" : "🐰"}</span>
                    <span>
                      {m.role === "parent" ? "Phụ huynh" : "Học sinh"}:{" "}
                      <strong>{m.name}</strong>{" "}
                      {m.name === activeRoom.creatorName && "(Chủ phòng)"}
                    </span>
                    <span style={{ color: "var(--accent)" }}>
                      {m.finished ? "✓ Đã xong Q" : "✍ Đang soạn"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* HIỂN THỊ CÁC GIAI ĐOẠN KHÁC NHAU CỦA PHÒNG KẾT NỐI */}

            {/* GIAI ĐOẠN 1: BIÊN SOẠN CÂU HỎI */}
            {activeRoom.status === "waiting" && (
              <div className="q-creation-workspace">
                {/* Khu vực tạo câu hỏi của tab hiện tại */}
                <div className="card">
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--primary)",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    Giai đoạn 1
                  </span>
                  <h3 style={{ fontSize: "22px", margin: "8px 0 16px" }}>
                    Biên Soạn Câu Hỏi Của Bạn
                  </h3>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "13.5px",
                      marginBottom: "20px",
                    }}
                  >
                    Hãy đặt những câu hỏi mà bạn luôn băn khoăn về đối phương.
                    Các câu hỏi nháp này được **bảo mật tuyệt đối** cho đến khi
                    bắt đầu bài kiểm tra chung.
                  </p>

                  {/* Disable editor if myQuestions are already finished */}
                  {(() => {
                    const myMember = activeRoom.members.find(
                      (m) => m.name === getMyUsernameInRoom(),
                    );
                    if (myMember?.finished) {
                      return (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "30px 10px",
                            background: "var(--accent-warm)",
                            borderRadius: "12px",
                            border: "1.5px dashed var(--accent)",
                          }}
                        >
                          <span style={{ fontSize: "28px" }}>✨</span>
                          <h4
                            style={{ color: "var(--accent)", marginTop: "8px" }}
                          >
                            Bạn Đã Hoàn Thành Biên Soạn!
                          </h4>
                          <p
                            style={{
                              fontSize: "13.5px",
                              color: "var(--text-muted)",
                              marginTop: "4px",
                            }}
                          >
                            Hãy thư giãn và chờ đợi mọi người hoàn tất danh sách
                            câu hỏi nhé.
                          </p>

                          {getMyUsernameInRoom() === activeRoom.creatorName && (
                            <div
                              style={{
                                marginTop: "24px",
                                paddingTop: "20px",
                                borderTop: "1px solid rgba(0,0,0,0.1)",
                              }}
                            >
                              {(() => {
                                const hasParent = activeRoom.members.some(
                                  (m) => m.role === "parent",
                                );
                                const hasChild = activeRoom.members.some(
                                  (m) => m.role === "child",
                                );
                                const allFinished = activeRoom.members.every(
                                  (m) => m.finished,
                                );

                                if (!hasParent || !hasChild) {
                                  return (
                                    <p
                                      style={{
                                        color: "#E67E22",
                                        fontSize: "13px",
                                        fontStyle: "italic",
                                        marginBottom: "12px",
                                      }}
                                    >
                                      ⏳ Cần ít nhất 1 Phụ huynh và 1 Học sinh
                                      để bắt đầu Test.
                                    </p>
                                  );
                                }
                                if (!allFinished) {
                                  return (
                                    <p
                                      style={{
                                        color: "#E67E22",
                                        fontSize: "13px",
                                        fontStyle: "italic",
                                        marginBottom: "12px",
                                      }}
                                    >
                                      ⏳ Đang chờ các thành viên khác hoàn tất
                                      câu hỏi...
                                    </p>
                                  );
                                }
                                return (
                                  <button
                                    className="btn btn-primary"
                                    style={{ width: "100%", maxWidth: "300px" }}
                                    onClick={handleStartQuiz}
                                  >
                                    Bắt Đầu Bài Test Chung 🚀
                                  </button>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div>
                          {/* Editor Input */}
                          <div className="form-group">
                            <label>Viết Câu Hỏi Mới Của Bạn</label>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <input
                                type="text"
                                placeholder="Nhập nội dung câu hỏi tại đây..."
                                value={newQuestionText}
                                onChange={(e) =>
                                  setNewQuestionText(e.target.value)
                                }
                              />
                              <button
                                className="btn btn-primary"
                                onClick={handleAddQuestion}
                              >
                                Thêm
                              </button>
                            </div>
                          </div>

                          {/* AI Question Presets suggestions */}
                          <div style={{ marginBottom: "24px" }}>
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: "600",
                                color: "var(--text-muted)",
                                display: "block",
                                marginBottom: "10px",
                              }}
                            >
                              💡 Gợi ý câu hỏi tinh tế từ AI:
                            </span>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              {PRESET_AI_QUESTIONS.map((q, idx) => (
                                <button
                                  className="preset-question-btn"
                                  onClick={() => handleSelectPresetQuestion(q)}
                                  key={idx}
                                >
                                  ✦ {q}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Action trigger complete question editing */}
                          <div
                            style={{
                              borderTop: "1.5px solid var(--border)",
                              paddingTop: "20px",
                              marginTop: "20px",
                            }}
                          >
                            {/* Requirement validation */}
                            {myMember?.questions.length === 0 ? (
                              <p
                                style={{
                                  color: "#C0392B",
                                  fontSize: "13px",
                                  fontStyle: "italic",
                                  marginBottom: "12px",
                                }}
                              >
                                ⚠️ Bạn cần tạo ít nhất 1 câu hỏi để hoàn thành.
                              </p>
                            ) : null}

                            <button
                              className="btn btn-primary"
                              style={{ width: "100%" }}
                              onClick={handleFinishMyQuestions}
                              disabled={myMember?.questions.length === 0}
                            >
                              Hoàn Thành Biên Soạn Câu Hỏi Của Tôi
                            </button>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Danh sách câu hỏi đã tạo của cá nhân bên phải */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  <div className="card" style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>
                      Danh Sách Câu Hỏi Đã Tạo
                    </h3>

                    {/* Render questions list of current user role */}
                    {(() => {
                      const myName = getMyUsernameInRoom();
                      const myMember = activeRoom.members.find(
                        (m) => m.name === myName,
                      );
                      const myQuestions = myMember ? myMember.questions : [];

                      if (myQuestions.length === 0) {
                        return (
                          <p
                            style={{
                              fontStyle: "italic",
                              color: "var(--text-muted)",
                              fontSize: "13.5px",
                            }}
                          >
                            Chưa có câu hỏi nào được thêm. Hãy soạn hoặc click
                            chọn gợi ý bên trái.
                          </p>
                        );
                      }

                      return (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          {myQuestions.map((q, idx) => (
                            <div className="added-q-item" key={idx}>
                              <span className="added-q-text">
                                {idx + 1}. {q}
                              </span>
                              {/* Disable remove button if questions editing is locked */}
                              {!myMember?.finished && (
                                <button
                                  className="btn-remove-q"
                                  onClick={() => handleRemoveQuestion(idx)}
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Trạng thái bảo mật */}
                  <div className="peer-drafting-status-card">
                    <span style={{ fontSize: "32px" }}>🔒</span>
                    <h4>Nội Dung Bảo Mật</h4>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      Mọi biên soạn đều được ẩn kín hoàn toàn đối với đối
                      phương. Giao diện chỉ hiển thị trạng thái chuẩn bị để kích
                      hoạt sự kết nối chung khi cả hai đã sẵn sàng.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* GIAI ĐOẠN 2: LÀM BÀI TEST CHUNG */}
            {activeRoom.status === "quiz" && (
              <div className="animate-slide">
                {(() => {
                  const myName = getMyUsernameInRoom();
                  const myMember = activeRoom.members.find(
                    (m) => m.name === myName,
                  );
                  const answers = myMember ? myMember.answers : {};
                  const myAnswersCount = Object.keys(answers).length;
                  const totalQuestions = activeRoom.compiledQuestions.length;

                  // TRẠNG THÁI CHỜ ĐỐI PHƯƠNG LÀM XONG BÀI TEST
                  if (
                    currentQuestionIndex >= totalQuestions ||
                    myAnswersCount === totalQuestions
                  ) {
                    return (
                      <div
                        className="card test-box-main"
                        style={{ textAlign: "center", padding: "50px 30px" }}
                      >
                        <span
                          style={{
                            fontSize: "48px",
                            animation: "pulse 1.5s infinite",
                          }}
                        >
                          ⏳
                        </span>
                        <h3 style={{ fontSize: "24px", margin: "16px 0 8px" }}>
                          Đang Đợi Người Thân Hoàn Thành...
                        </h3>
                        <p
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "15px",
                            maxWidth: "500px",
                            margin: "0 auto",
                          }}
                        >
                          Bạn đã hoàn thành xuất sắc tất cả câu trả lời của
                          mình! Hãy thưởng thức một tách trà ấm trong khi chờ
                          đối phương chia sẻ xong suy nghĩ của họ nhé.
                        </p>

                        <div
                          style={{
                            marginTop: "30px",
                            display: "flex",
                            gap: "8px",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              backgroundColor: "var(--primary)",
                              borderRadius: "50%",
                              animation: "pulse 1.2s infinite",
                            }}
                          ></div>
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              backgroundColor: "var(--primary)",
                              borderRadius: "50%",
                              animation: "pulse 1.2s infinite 0.2s",
                            }}
                          ></div>
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              backgroundColor: "var(--primary)",
                              borderRadius: "50%",
                              animation: "pulse 1.2s infinite 0.4s",
                            }}
                          ></div>
                        </div>

                        {/* Helper tip for local testing simulation */}
                        <div
                          style={{
                            marginTop: "40px",
                            padding: "16px",
                            backgroundColor: "var(--accent-warm)",
                            borderRadius: "12px",
                            border: "1.5px dashed var(--border)",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "700",
                              fontSize: "13px",
                              color: "var(--primary)",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            💡 Hướng dẫn mô phỏng 2 thiết bị:
                          </span>
                          <p
                            style={{
                              fontSize: "12.5px",
                              color: "var(--text-muted)",
                            }}
                          >
                            Hãy mở một tab trình duyệt khác ở chế độ ẩn danh
                            (hoặc trình duyệt khác), tham gia phòng{" "}
                            <strong>{activeRoom.id}</strong> bằng vai trò ngược
                            lại và làm bài test. Cả hai tab sẽ lập tức đồng bộ
                            chuyển sang màn hình duyệt kết quả!
                          </p>
                        </div>
                      </div>
                    );
                  }

                  // TRẠNG THÁI TRẢ LỜI CÂU HỎI TỪNG CÂU
                  const activeQ =
                    activeRoom.compiledQuestions[currentQuestionIndex];
                  const qCreatorText =
                    activeQ.creator === "parent"
                      ? "Câu hỏi từ Cha mẹ"
                      : "Câu hỏi từ Con cái";

                  return (
                    <div className="card test-box-main">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "var(--primary)",
                            textTransform: "uppercase",
                          }}
                        >
                          {qCreatorText}
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "var(--text-muted)",
                          }}
                        >
                          Câu {currentQuestionIndex + 1} / {totalQuestions}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="test-progress-bar-wrapper">
                        <div
                          className="test-progress-fill"
                          style={{
                            width: `${(currentQuestionIndex / totalQuestions) * 100}%`,
                          }}
                        ></div>
                      </div>

                      <h3 className="q-display-heading">{activeQ.text}</h3>

                      {/* Answer Input */}
                      <div className="form-group" style={{ marginTop: "20px" }}>
                        <label>Chia sẻ suy nghĩ chân thật của bạn</label>
                        <textarea
                          rows="4"
                          placeholder="Hãy bộc bạch suy nghĩ của mình tại đây. Chia sẻ ôn hòa luôn là chìa khóa mở lối yêu thương..."
                          value={tempAnswerText}
                          onChange={(e) => setTempAnswerText(e.target.value)}
                        />
                      </div>

                      {/* Emotion Selector */}
                      <div className="form-group">
                        <label>Cảm xúc đi kèm của bạn khi trả lời</label>
                        <div className="emotion-select-row">
                          {[
                            { key: "hopeful", emoji: "✨", label: "Hy vọng" },
                            { key: "happy", emoji: "😊", label: "Vui vẻ" },
                            { key: "anxious", emoji: "🥺", label: "Lo âu" },
                            { key: "stressed", emoji: "😣", label: "Áp lực" },
                          ].map((item) => (
                            <button
                              className={`emotion-chip-btn ${tempEmotion === item.key ? "selected" : ""}`}
                              onClick={() => setTempEmotion(item.key)}
                              key={item.key}
                              type="button"
                            >
                              <span className="emotion-icon-sim">
                                {item.emoji}
                              </span>
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "30px",
                        }}
                      >
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            if (currentQuestionIndex > 0) {
                              setCurrentQuestionIndex((prev) => prev - 1);
                              // Load previous
                              const myName = getMyUsernameInRoom();
                              const myMember = activeRoom.members.find(
                                (m) => m.name === myName,
                              );
                              const existingAnswer =
                                myMember?.answers[currentQuestionIndex - 1];
                              setTempAnswerText(
                                existingAnswer ? existingAnswer.text : "",
                              );
                              setTempEmotion(
                                existingAnswer
                                  ? existingAnswer.emotion
                                  : "hopeful",
                              );
                            }
                          }}
                          disabled={currentQuestionIndex === 0}
                        >
                          Quay lại câu trước
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={handleNextQuizQuestion}
                          disabled={!tempAnswerText.trim()}
                        >
                          {currentQuestionIndex === totalQuestions - 1
                            ? "Nộp bài kiểm tra"
                            : "Tiếp tục câu sau"}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* GIAI ĐOẠN 3: DUYỆT ĐÁP ÁN SO SÁNH VÀ AI TƯ VẤN */}
            {activeRoom.status === "review" && (
              <div className="review-panel animate-slide">
                {(() => {
                  const revIdx = activeRoom.currentReviewIndex;
                  const totalQ = activeRoom.compiledQuestions.length;
                  const activeQ = activeRoom.compiledQuestions[revIdx];
                  const parents = activeRoom.members.filter(
                    (m) => m.role === "parent",
                  );
                  const children = activeRoom.members.filter(
                    (m) => m.role === "child",
                  );

                  // Tư vấn AI được tính toán qua Backend trong useEffect phía trên và lưu vào activeReviewAdvice

                  return (
                    <div>
                      <div className="review-meta-bar">
                        <span>🔍 DUYỆT KẾT QUẢ TỪNG CÂU</span>
                        <span>
                          Câu hỏi {revIdx + 1} trên tổng số {totalQ}
                        </span>
                      </div>

                      {/* Question card */}
                      <div className="review-q-card-title">
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--primary)",
                            fontWeight: "700",
                            textTransform: "uppercase",
                          }}
                        >
                          Nội dung câu hỏi:
                        </span>
                        <h2 style={{ fontSize: "22px", marginTop: "6px" }}>
                          {activeQ.text}
                        </h2>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                          }}
                        >
                          Tạo bởi:{" "}
                          {activeQ.creator === "parent"
                            ? "Phụ huynh"
                            : "Học sinh"}
                        </span>
                      </div>

                      {/* Split Answers Display */}
                      <div className="review-answers-grid">
                        {/* Parent Answer card */}
                        <div className="answer-card-col parent">
                          <span className="answer-header-title">
                            👨‍👩‍👧‍👦 Phụ huynh
                          </span>
                          {parents.map((p, idx) => {
                            const ans = p.answers[revIdx];
                            return (
                              <div key={idx} style={{ marginBottom: "15px" }}>
                                <strong style={{ fontSize: "13px" }}>
                                  {p.name}:
                                </strong>
                                <p
                                  className="answer-text-content"
                                  style={{ margin: "4px 0" }}
                                >
                                  "{ans ? ans.text : "Chưa trả lời"}"
                                </p>
                                {ans && (
                                  <div
                                    className="answer-emotion-badge"
                                    style={{ marginTop: "5px" }}
                                  >
                                    <span>Trạng thái:</span>
                                    <strong>
                                      {getEmotionIcon(ans.emotion).emoji}{" "}
                                      {getEmotionIcon(ans.emotion).text}
                                    </strong>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Child Answer card */}
                        <div className="answer-card-col child">
                          <span className="answer-header-title">
                            🎒 Học sinh
                          </span>
                          {children.map((c, idx) => {
                            const ans = c.answers[revIdx];
                            return (
                              <div key={idx} style={{ marginBottom: "15px" }}>
                                <strong style={{ fontSize: "13px" }}>
                                  {c.name}:
                                </strong>
                                <p
                                  className="answer-text-content"
                                  style={{ margin: "4px 0" }}
                                >
                                  "{ans ? ans.text : "Chưa trả lời"}"
                                </p>
                                {ans && (
                                  <div
                                    className="answer-emotion-badge"
                                    style={{ marginTop: "5px" }}
                                  >
                                    <span>Trạng thái:</span>
                                    <strong>
                                      {getEmotionIcon(ans.emotion).emoji}{" "}
                                      {getEmotionIcon(ans.emotion).text}
                                    </strong>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* empathetic AI Advice card */}
                      <div className="ai-advice-wrapper">
                        <div className="ai-advice-header">
                          <span>🌱 PHÂN TÍCH TỪ AI</span>
                        </div>

                        {!activeReviewAdvice && (
                          <div
                            style={{
                              padding: "20px",
                              textAlign: "center",
                              fontStyle: "italic",
                              color: "var(--text-light)",
                            }}
                          >
                            <p>Đang phân tích phản hồi bằng AI RAG...</p>
                          </div>
                        )}

                        {activeReviewAdvice && (
                          <div className="ai-advice-body">
                            {/* Điểm số */}

                            <div className="ai-score-row">
                              <div className="score-card">
                                <p>💛 Thấu hiểu</p>

                                <h2>{activeReviewAdvice.understanding}%</h2>
                              </div>

                              <div className="score-card">
                                <p>🤝 Tin tưởng</p>

                                <h2>{activeReviewAdvice.trust}%</h2>
                              </div>

                              <div className="score-card">
                                <p>⚠️ Xung đột</p>

                                <h2>{activeReviewAdvice.conflict}%</h2>
                              </div>
                            </div>

                            {/* Điểm giống */}

                            <div className="advice-section">
                              <h3>🌿 Điểm chung</h3>

                              <p>{activeReviewAdvice.similarity}</p>
                            </div>

                            {/* Lời khuyên phụ huynh */}

                            <div className="advice-section">
                              <h3>👨‍👩‍👧 Cho phụ huynh</h3>

                              <p>{activeReviewAdvice.parentAdvice}</p>
                            </div>

                            {/* Lời khuyên học sinh */}

                            <div className="advice-section">
                              <h3>🎓 Cho học sinh</h3>

                              <p>{activeReviewAdvice.childAdvice}</p>
                            </div>

                            {/* Hành động */}

                            <div className="advice-section">
                              <h3>✅ Hành động đề xuất</h3>

                              <p>{activeReviewAdvice.action}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: "center", marginTop: "30px" }}>
                        <button
                          className="btn btn-primary"
                          onClick={handleNextReviewQuestion}
                          style={{ minWidth: "200px" }}
                        >
                          {revIdx === totalQ - 1
                            ? "Xem báo cáo tổng hợp kết quả"
                            : "Tiếp tục duyệt câu sau ➜"}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* GIAI ĐOẠN 4: BÁO CÁO TỔNG HỢP CUỐI CÙNG */}
            {activeRoom.status === "completed" && (
              <div className="container-narrow animate-slide">
                {/* Circular overall empathy score */}
                <div className="final-score-header">
                  <div className="circular-score-val">
                    <span className="score-number">
                      {calculateUnderstandingScore(activeRoom)}%
                    </span>
                    <span className="score-label">Mức thấu cảm</span>
                  </div>
                  <h2 style={{ fontSize: "26px", marginBottom: "8px" }}>
                    Chúc mừng gia đình đã thấu hiểu nhau hơn!
                  </h2>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "14.5px",
                      maxWidth: "500px",
                      margin: "0 auto",
                    }}
                  >
                    Dựa trên quá trình đối thoại và phản hồi cảm xúc của các
                    thành viên, AI thấu cảm đã đúc kết được báo cáo định hướng
                    hành vi dưới đây nhằm tiếp thêm động lực gắn kết gia đình.
                  </p>
                </div>

                {/* Final advice split */}
                <div className="final-advice-split">
                  {/* Advice for Parent group */}
                  <div className="final-advice-card parent">
                    <h3 style={{ color: "var(--secondary)" }}>
                      🐻 Nhóm Thay Đổi Cho Cha Mẹ
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text-muted)",
                        marginBottom: "16px",
                      }}
                    >
                      Những hành vi nhỏ có thể làm dịu cảm giác lo lắng của con
                      cái:
                    </p>
                    <ul className="advice-list-items">
                      <li>
                        <strong>Ghi nhận nỗ lực:</strong> Con cái rất thèm khát
                        sự ghi nhận. Thay vì chỉ ra lỗi sai ngay, hãy khen ngợi
                        hành động cố gắng của con trước.
                      </li>
                      <li>
                        <strong>Giảm câu hỏi phán xét:</strong> Hạn chế các câu
                        hỏi tu từ mang tính kiểm soát như{" "}
                        <em>"Con đi học kiểu gì thế?"</em>, đổi thành câu hỏi
                        mở: <em>"Bố mẹ có thể giúp gì được con không?"</em>.
                      </li>
                      <li>
                        <strong>Kiểm soát nỗi lo lắng:</strong> Hãy học cách tin
                        tưởng và cho con cơ hội tự chịu trách nhiệm với những
                        quyết định nhỏ trong cuộc sống.
                      </li>
                    </ul>
                  </div>

                  {/* Advice for Child group */}
                  <div className="final-advice-card child">
                    <h3 style={{ color: "var(--primary)" }}>
                      🐰 Nhóm Thay Đổi Cho Con Cái
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text-muted)",
                        marginBottom: "16px",
                      }}
                    >
                      Những hành động giúp bố mẹ cảm thấy được tôn trọng và an
                      tâm:
                    </p>
                    <ul className="advice-list-items">
                      <li>
                        <strong>Chủ động thông báo:</strong> Chia sẻ trước những
                        kế hoạch nhỏ như giờ đi chơi, kết quả học tập để cha mẹ
                        bớt hoài nghi và lo sợ.
                      </li>
                      <li>
                        <strong>Đón nhận sự quan tâm:</strong> Hãy hiểu rằng lời
                        cằn nhằn đôi khi chỉ là thói quen diễn đạt vụng về của
                        tình thương cha mẹ.
                      </li>
                      <li>
                        <strong>Bộc bạch cảm xúc ôn hòa:</strong> Thay vì im
                        lặng hay đóng sập cửa, hãy dùng cấu trúc:{" "}
                        <em>
                          "Con rất muốn làm việc này, bố mẹ hãy cho con thử
                          nghiệm một lần nhé."
                        </em>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Print report action footer */}
                <div
                  className="card"
                  style={{ textAlign: "center", padding: "24px" }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      marginBottom: "16px",
                    }}
                  >
                    Bạn có thể tải báo cáo thấu hiểu này về lưu giữ làm kỷ niệm
                    cột mốc gia đình hoặc in ra bản cứng.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSaveConclusion(activeRoom)}
                      style={{ minWidth: "180px" }}
                    >
                      💾 Lưu Kết Luận Thấu Hiểu
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => window.print()}
                      style={{ minWidth: "150px" }}
                    >
                      🖨️ Tải PDF / In Ấn
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleLeaveRoom}
                      style={{
                        minWidth: "150px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      Bảng Điều Khiển
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="mobile-bottom-nav">
        <a
          className={`mobile-nav-item ${currentView === "home" ? "active" : ""}`}
          onClick={() => navigateTo("home")}
        >
          <span className="mobile-nav-icon">🏠</span>
          <span className="mobile-nav-text">Trang Chủ</span>
        </a>
        <a
          className={`mobile-nav-item ${currentView === "mechanism" ? "active" : ""}`}
          onClick={() => navigateTo("mechanism")}
        >
          <span className="mobile-nav-icon">⚙️</span>
          <span className="mobile-nav-text">Hướng Dẫn</span>
        </a>
        {currentUser && (
          <>
            <a
              className={`mobile-nav-item ${currentView === "saved-conclusions" ? "active" : ""}`}
              onClick={() => navigateTo("saved-conclusions")}
            >
              <span className="mobile-nav-icon">📖</span>
              <span className="mobile-nav-text">Lưu Trữ</span>
            </a>
            <a
              className={`mobile-nav-item ${currentView === "emotion-diary" ? "active" : ""}`}
              onClick={() => navigateTo("emotion-diary")}
            >
              <span className="mobile-nav-icon">📔</span>
              <span className="mobile-nav-text">Nhật Ký</span>
            </a>
            <a
              className={`mobile-nav-item ${currentView === "challenge" ? "active" : ""}`}
              onClick={() => navigateTo("challenge")}
            >
              <span className="mobile-nav-icon">🎯</span>
              <span className="mobile-nav-text">Thử Thách</span>
            </a>
          </>
        )}
        <a
          className={`mobile-nav-item ${currentView === "resources" ? "active" : ""}`}
          onClick={() => navigateTo("resources")}
        >
          <span className="mobile-nav-icon">📚</span>
          <span className="mobile-nav-text">Tài Nguyên</span>
        </a>
        <a
          className={`mobile-nav-item ${currentView === "ai-info" ? "active" : ""}`}
          onClick={() => navigateTo("ai-info")}
        >
          <span className="mobile-nav-icon">🤖</span>
          <span className="mobile-nav-text">AI</span>
        </a>
        <a
          className={`mobile-nav-item ${currentView === "about" ? "active" : ""}`}
          onClick={() => navigateTo("about")}
        >
          <span className="mobile-nav-icon">👥</span>
          <span className="mobile-nav-text">Chúng Tôi</span>
        </a>
      </nav>

      {/* FOOTER WARM AND LOVING */}
      <footer>
        <div className="container">
          <p
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: "600",
              color: "var(--secondary)",
            }}
          >
            🏡 "Gia đình là nơi bão dừng sau cánh cửa. Lắng nghe để thấu cảm sâu
            sắc."
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            © 2026 Dự Án Hiểu Nhau - Trợ Lý AI Hàn Gắn Khoảng Cách Thế Hệ. All
            rights reserved.
          </p>
        </div>
      </footer>
      {/* {isRoomLoading && <LoadingOverlay />} */}
      {/* POPUP THÔNG BÁO THÔNG MINH (GLASSMORPHIC DIALOG MODAL) */}
      {showAuthAlertModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(31, 24, 19, 0.65)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "20px",
          }}
          className="animate-fade"
        >
          <div
            style={{
              backgroundColor: "var(--card-bg)",
              border: "3px solid var(--primary)",
              borderRadius: "28px",
              padding: "32px 24px",
              maxWidth: "380px",
              width: "100%",
              boxShadow: "0 24px 48px rgba(92, 61, 46, 0.25)",
              textAlign: "center",
              position: "relative",
            }}
            className="animate-slide"
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                lineHeight: 1,
              }}
            >
              {authAlertIcon}
            </div>

            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "22px",
                color: "var(--secondary)",
                marginBottom: "12px",
              }}
            >
              {authAlertTitle || "Thông Báo Quan Trọng"}
            </h3>

            <p
              style={{
                fontSize: "15px",
                color: "var(--text-main)",
                fontWeight: 600,
                lineHeight: 1.5,
                marginBottom: "26px",
              }}
            >
              {authAlertMessage}
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {authAlertRedirect ? (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowAuthAlertModal(false);
                      navigateTo(authAlertRedirect);
                    }}
                    style={{ width: "100%", fontWeight: "700" }}
                  >
                    Đăng Nhập Ngay 🔑
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowAuthAlertModal(false)}
                    style={{ width: "100%", fontWeight: "700" }}
                  >
                    Đóng Cửa Sổ
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAuthAlertModal(false)}
                  style={{ width: "100%", fontWeight: "700" }}
                >
                  Tôi Đã Hiểu
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHI TIẾT BÁO CÁO KẾT LUẬN ĐÃ LƯU (SAVED CONCLUSION DETAIL MODAL) */}
      {activeViewedConclusion && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(31, 24, 19, 0.7)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          className="animate-fade"
        >
          <div
            style={{
              backgroundColor: "var(--bg)",
              border: "2.5px solid var(--border)",
              borderRadius: "28px",
              padding: "30px 24px",
              maxWidth: "650px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.4)",
              position: "relative",
            }}
            className="animate-slide"
          >
            {/* Modal Close Icon */}
            <button
              onClick={() => setActiveViewedConclusion(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "var(--text-muted)",
              }}
            >
              ✕
            </button>

            {/* Header info */}
            <div
              style={{
                textAlign: "center",
                marginBottom: "24px",
                paddingRight: "20px",
              }}
            >
              <span
                style={{
                  backgroundColor: "rgba(140, 98, 57, 0.1)",
                  color: "var(--secondary)",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  display: "inline-block",
                  marginBottom: "8px",
                }}
              >
                Phòng: {activeViewedConclusion.roomName}
              </span>
              <h2 style={{ fontSize: "24px", margin: "0 0 6px 0" }}>
                Báo Cáo Thấu Hiểu Gia Đình
              </h2>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Đã lưu vào lúc:{" "}
                {new Date(activeViewedConclusion.savedAt).toLocaleDateString(
                  "vi-VN",
                )}{" "}
                {new Date(activeViewedConclusion.savedAt).toLocaleTimeString(
                  "vi-VN",
                  { hour: "2-digit", minute: "2-digit" },
                )}
              </span>
            </div>

            {/* Score circle */}
            <div
              className="final-score-header"
              style={{ padding: "20px", marginBottom: "24px" }}
            >
              <div
                className="circular-score-val"
                style={{ margin: "0 auto 12px auto" }}
              >
                <span className="score-number">
                  {activeViewedConclusion.score}%
                </span>
                <span className="score-label">Mức thấu cảm</span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                Hành trình đối thoại thấu hiểu của{" "}
                <strong>
                  {activeViewedConclusion.creatorRole === "parent"
                    ? activeViewedConclusion.creatorName
                    : activeViewedConclusion.joinerName}{" "}
                  (Cha Mẹ)
                </strong>{" "}
                và{" "}
                <strong>
                  {activeViewedConclusion.creatorRole === "child"
                    ? activeViewedConclusion.creatorName
                    : activeViewedConclusion.joinerName}{" "}
                  (Con Cái)
                </strong>
                .
              </p>
            </div>

            {/* Compiled answers summary */}
            <h3
              style={{
                fontSize: "16px",
                borderBottom: "2px solid var(--border)",
                paddingBottom: "8px",
                marginBottom: "16px",
                color: "var(--primary)",
              }}
            >
              💬 Nội Dung Đối Thoại & Lời Khuyên AI
            </h3>

            {activeViewedConclusion.compiledQuestions.map((q, idx) => {
              const parentAns =
                activeViewedConclusion.creatorRole === "parent"
                  ? activeViewedConclusion.answers.creator[idx]
                  : activeViewedConclusion.answers.joiner[idx];
              const childAns =
                activeViewedConclusion.creatorRole === "child"
                  ? activeViewedConclusion.answers.creator[idx]
                  : activeViewedConclusion.answers.joiner[idx];

              const parentName =
                activeViewedConclusion.creatorRole === "parent"
                  ? activeViewedConclusion.creatorName
                  : activeViewedConclusion.joinerName;
              const childName =
                activeViewedConclusion.creatorRole === "child"
                  ? activeViewedConclusion.creatorName
                  : activeViewedConclusion.joinerName;

              const aiAdviceHTML = generateSimulatedAIAdvice(
                q.text,
                parentAns ? parentAns.text : "Chưa trả lời",
                parentAns ? parentAns.emotion : "hopeful",
                childAns ? childAns.text : "Chưa trả lời",
                childAns ? childAns.emotion : "hopeful",
              );

              return (
                <div
                  key={q.id}
                  style={{
                    backgroundColor: "rgba(140, 98, 57, 0.04)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      fontWeight: "700",
                    }}
                  >
                    CÂU HỎI {idx + 1}
                  </span>
                  <h4 style={{ fontSize: "15px", margin: "4px 0 12px 0" }}>
                    {q.text}
                  </h4>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12.5px",
                        borderLeft: "3px solid var(--secondary)",
                        paddingLeft: "8px",
                      }}
                    >
                      <strong>🐻 {parentName} (Cha Mẹ):</strong> "
                      {parentAns ? parentAns.text : "Chưa trả lời"}"
                      {parentAns && (
                        <span
                          style={{
                            marginLeft: "6px",
                            fontSize: "11px",
                            opacity: 0.8,
                          }}
                        >
                          ({getEmotionIcon(parentAns.emotion).emoji}{" "}
                          {getEmotionIcon(parentAns.emotion).text})
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "12.5px",
                        borderLeft: "3px solid var(--primary)",
                        paddingLeft: "8px",
                      }}
                    >
                      <strong>🐰 {childName} (Con Cái):</strong> "
                      {childAns ? childAns.text : "Chưa trả lời"}"
                      {childAns && (
                        <span
                          style={{
                            marginLeft: "6px",
                            fontSize: "11px",
                            opacity: 0.8,
                          }}
                        >
                          ({getEmotionIcon(childAns.emotion).emoji}{" "}
                          {getEmotionIcon(childAns.emotion).text})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Advice body */}
                  {/* <div
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "12px",
                      fontSize: "12px",
                      lineHeight: 1.4,
                      color: "var(--text)",
                    }}
                    dangerouslySetInnerHTML={{ __html: aiAdviceHTML }}
                  /> */}
                </div>
              );
            })}

            {/* Static guidance cards */}
            <h3
              style={{
                fontSize: "16px",
                borderBottom: "2px solid var(--border)",
                paddingBottom: "8px",
                marginTop: "24px",
                marginBottom: "16px",
                color: "var(--primary)",
              }}
            >
              🌱 Định Hướng Hành Vi Thay Đổi
            </h3>

            <div
              className="final-advice-split"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div
                className="final-advice-card parent"
                style={{ margin: 0, padding: "16px" }}
              >
                <h4 style={{ color: "var(--secondary)", margin: "0 0 8px 0" }}>
                  🐻 Nhóm Thay Đổi Cho Cha Mẹ
                </h4>
                <ul
                  className="advice-list-items"
                  style={{ fontSize: "12.5px", margin: 0, paddingLeft: "20px" }}
                >
                  <li>
                    <strong>Ghi nhận nỗ lực:</strong> Khen ngợi và ghi nhận hành
                    vi tích cực trước khi chỉ ra lỗi sai.
                  </li>
                  <li>
                    <strong>Hỏi han ôn hòa:</strong> Đổi câu hỏi kiểm soát thành
                    câu hỏi mở: <em>"Bố mẹ có thể giúp gì được con không?"</em>.
                  </li>
                  <li>
                    <strong>Đặt niềm tin:</strong> Cho con cơ hội chịu trách
                    nhiệm với những quyết định nhỏ.
                  </li>
                </ul>
              </div>

              <div
                className="final-advice-card child"
                style={{ margin: 0, padding: "16px" }}
              >
                <h4 style={{ color: "var(--primary)", margin: "0 0 8px 0" }}>
                  🐰 Nhóm Thay Đổi Cho Con Cái
                </h4>
                <ul
                  className="advice-list-items"
                  style={{ fontSize: "12.5px", margin: 0, paddingLeft: "20px" }}
                >
                  <li>
                    <strong>Chủ động thông báo:</strong> Chia sẻ trước những kế
                    hoạch nhỏ để giảm bớt hoài nghi của cha mẹ.
                  </li>
                  <li>
                    <strong>Tâm sự ôn hòa:</strong> Đón nhận lời cằn nhằn như
                    một thói quen diễn đạt vụng về của tình thương.
                  </li>
                  <li>
                    <strong>Bộc bạch bình tĩnh:</strong> Dùng cấu trúc:{" "}
                    <em>
                      "Con rất muốn..., bố mẹ hãy cho con thử nghiệm một lần
                      nhé."
                    </em>
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal footer Close */}
            <div style={{ textAlign: "center" }}>
              <button
                className="btn btn-primary"
                onClick={() => setActiveViewedConclusion(null)}
                style={{ minWidth: "150px" }}
              >
                Đóng Báo Cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
