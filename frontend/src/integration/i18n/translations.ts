export const translationResources = {
  en: {
    translation: {
      common: {
        eventsync: 'Nankai EventSync',
        guest: 'Guest',
        loading: 'Loading...',
        tryAgain: 'Try again',
        save: 'Save',
        cancel: 'Cancel',
        close: 'Close',
      },
      nav: {
        tagline: 'Campus events, reimagined',
        home: 'Home',
        dashboard: 'Dashboard',
        events: 'Events',
        createEvent: 'Create Event',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        language: 'Language',
        deleteAccount: 'Delete Account',
      },
      auth: {
        welcomeBack: 'Welcome back',
        loginTitle: 'Log in',
        loginSubtitle:
          'Use your EventSync account to access protected routes and the live event dashboard.',
        loginSubmit: 'Log in',
        registerHero: 'Create your access',
        registerTitle: 'Create account',
        registerSubtitle:
          'Pick the role that matches your campus journey. You can start browsing events right after registration.',
        registerSubmit: 'Create account',
        verifyEyebrow: 'Email Verification',
        verifyTitle: 'Verify your email before signing in.',
        verifyDescription:
          'We sent a 6-digit code to your email address. Enter it below to activate your EventSync account.',
        verifyFormTitle: 'Enter your verification code',
        verifyFormSubtitle: 'Use the code from your inbox to finish registration.',
        verifySubmit: 'Verify email',
        verifyingButton: 'Verifying...',
        resendCode: 'Resend Code',
        resendingCode: 'Resending...',
        resendCodeHint:
          'Request a new verification code if the email has not arrived yet.',
        resendCodeCountdown:
          'You can request a new code in {{seconds}} seconds.',
        resendCodeError:
          'We could not resend the verification code right now.',
        didNotReceiveCode: "Didn't receive the code?",
        fullName: 'Full name',
        email: 'Email address',
        password: 'Password',
        confirmPassword: 'Confirm password',
        verificationCode: 'Verification code',
        verificationCodePlaceholder: 'Enter 6-digit code',
        verificationInstructionsTitle: 'What to do next',
        verificationInstructions:
          'Open your email inbox, copy the 6-digit code we sent, and submit it here before the code expires.',
        verificationError:
          'We could not verify that code. Please check it and try again.',
        devOtpHint: 'Development code: {{code}}',
        accountType: 'Account type',
        student: 'Student',
        organizer: 'Organizer',
        studentDescription: 'Browse and RSVP to events.',
        organizerDescription: 'Create and manage event listings.',
        alreadyRegistered: 'Already registered?',
        loginInstead: 'Log in instead',
        needAccount: 'Need an account?',
        createOneHere: 'Create one here',
        continueError: 'Unable to continue.',
        signInHeroTitle: 'Sign in to manage campus events in real time.',
        signInHeroDescription:
          'EventSync helps students discover what is happening on campus and helps organizers keep every update synced instantly.',
        joinHeroTitle:
          'Join the platform built for unforgettable campus events.',
        joinHeroDescription:
          'Register as a student to explore and RSVP, or as an organizer to publish and manage event experiences across campus.',
      },
      home: {
        heroEyebrow: 'Public Event Hub',
        heroTitle: 'Discover what is happening at Nankai before you sign in.',
        heroDescription:
          'Browse upcoming events by category, then create an account to RSVP, chat live, and manage event pages.',
        searchLabel: 'Search events',
        searchPlaceholder: 'Search by title, location, or keyword',
        categoryLabel: 'Category filter',
        allCategories: 'All categories',
        sectionDescriptionAcademic:
          'Lectures, workshops, research talks, and study-focused gatherings.',
        sectionDescriptionSports:
          'Competitions, fitness events, and team activities across campus.',
        sectionDescriptionCultural:
          'Arts, clubs, festivals, performances, and cultural showcases.',
        sectionDescriptionOthers:
          'Community meetups, campus life moments, and everything else.',
        emptySearch: 'No events match the current search and filter.',
        emptyUpcomingTitle: 'No upcoming events yet.',
        emptyUpcomingMessage:
          'Published events from organizers will appear here once they are available.',
        emptySearchTitle: 'No events match your search.',
        emptySearchMessage:
          'Try changing your search term or selecting a different category.',
        emptySection: 'No events in this section right now.',
        upcomingEvents: 'upcoming events',
        matchingEvents: 'matching events',
        browseAll: 'Browse all events',
        loginCta: 'Login',
        registerCta: 'Register',
      },
      recommendations: {
        title: 'Recommended For You',
        homeDescription:
          'AI-assisted picks based on your RSVP history, favorite categories, and tags.',
        dashboardHeading: 'Your next campus picks',
        dashboardDescription:
          'These recommendations are generated with Llama via Groq, with a safe local fallback if AI is unavailable.',
        loadingTitle: 'Loading recommendations',
        loadingMessage:
          'Finding events that match your recent interests.',
        errorTitle: 'Unable to load recommendations',
        homeFeedErrorMessage:
          "We couldn't load events right now. Please try again later.",
        emptyTitle: 'No recommendations yet',
        emptyMessage:
          'RSVP to a few events and EventSync will start tailoring suggestions for you.',
        noUpcomingTitle: 'No upcoming events',
        noUpcomingMessage:
          'There are no upcoming events to show right now. Please check back later.',
        starts: 'Starts',
        open: 'Open detail',
      },
      categories: {
        academic: 'Academic',
        sports: 'Sports',
        artAndCulture: 'Art and culture',
        others: 'Others',
      },
      dashboard: {
        eyebrow: 'Dashboard',
        greeting: 'Hello, {{name}}.',
        description:
          'Nankai Events. Browse events, step into live rooms, and, if you are an organizer, publish polished event pages directly from here.',
        explore: 'Explore events',
        createEvent: 'Create a new event',
        role: 'Role: {{role}}',
        discover: 'Discover',
        discoverTitle: 'Live event feed',
        discoverBody:
          'Students can browse the latest campus events and open the real-time detail page.',
        sync: 'Synchronize',
        syncTitle: 'Real-time RSVP + chat',
        syncBody:
          'Room messages and RSVP state update across tabs almost instantly.',
        manage: 'Manage',
        manageTitle: 'Organizer controls',
        manageBodyOrganizer:
          'Create or edit your event pages, upload posters, and keep your event information up to date.',
        manageBodyStudent:
          'Organizer accounts can create and edit event pages.',
        accountSettings: 'Account Settings',
        deleteTitle: 'Delete your account',
        deleteDescription:
          'This permanently removes your account. Organizer-owned events, your RSVPs, your messages, and any active live-room connections are cleaned up as part of the deletion flow.',
        deleteButton: 'Delete account',
        deletingButton: 'Deleting account...',
        deleteConfirmTitle: 'Delete your account permanently?',
        deleteConfirmMessage:
          'This action is permanent and cannot be undone. Your account, RSVPs, messages, and any organizer-owned events will be deleted.',
      },
      events: {
        eyebrow: 'Events Feed',
        title: 'Campus events from the live backend',
        description:
          'Browse upcoming activity, step into the live event room, and manage organizer-owned events from a single polished screen.',
        create: 'Create event',
        loadingTitle: 'Loading events',
        loadingMessage: 'Fetching the latest event feed from the backend.',
        errorTitle: 'Unable to load events',
        emptyTitle: 'No published events yet',
        emptyMessage:
          'Once your organizers create events, they will appear here.',
        openDetail: 'Open live detail',
        signInToViewDetails: 'Sign in to view details',
        editEvent: 'Edit event',
        starts: 'Starts',
        noEvents: 'No events yet',
        searchPlaceholder: 'Search title or location',
        organizerFilterPlaceholder: 'Filter by organizer ID',
        allStatuses: 'All statuses',
        fromDate: 'From date',
        toDate: 'To date',
        previousMonth: 'Previous month',
        nextMonth: 'Next month',
        adminScope:
          'Admin view shows events across all organisers for the selected date range.',
        organizerScope:
          'Organiser view is scoped to your own events in the selected date range.',
        studentScope:
          'Student view shows published events that match the selected date range.',
        adminTableEyebrow: 'Admin Controls',
        adminTableTitle: 'Cross-organiser event management',
        adminTableDescription:
          'Review events across organisers, apply filters, update statuses, and delete any event directly from this table.',
        adminTableEmptyTitle: 'No matching events for the admin table',
        adminTableEmptyMessage:
          'Adjust the organiser, status, or date filters to find a different set of events.',
        tableEvent: 'Event',
        tableOrganizer: 'Organizer',
        tableStatus: 'Status',
        tableStarts: 'Starts',
        tableEnds: 'Ends',
        tableActions: 'Actions',
        tableOpen: 'Open',
        tableDelete: 'Delete',
        tableDeleting: 'Deleting...',
        tableUpdating: 'Updating...',
        tablePublish: 'Publish',
        tableMoveToDraft: 'Move to draft',
        tableMarkCompleted: 'Mark completed',
        tableCancelEvent: 'Cancel event',
        adminTableDeleteConfirmTitle:
          'Delete this event from the system?',
        adminTableDeleteConfirmMessage:
          'This will permanently remove "{{title}}" scheduled for {{date}} from the platform for all users, including its RSVP and chat data.',
        adminTableDeleteErrorTitle: 'Unable to delete event',
        adminTableDeleteErrorMessage:
          'Could not delete this event. Please try again or contact an administrator.',
        adminTableStatusErrorTitle: 'Unable to update event status',
        adminTableStatusErrorMessage:
          'Could not update event status. Please try again.',
      },
      eventForm: {
        createEyebrow: 'Create Event',
        editEyebrow: 'Edit Event',
        createTitle: 'Publish a new campus event',
        editTitle: 'Update your event page',
        description:
          'Add the event details students need, choose a status, and upload a poster.',
        titleLabel: 'Event title',
        descriptionLabel: 'Description',
        categoryLabel: 'Category',
        locationLabel: 'Location',
        startLabel: 'Start date & time',
        endLabel: 'End date & time',
        timezoneLabel: 'Timezone',
        capacityLabel: 'Max attendees',
        capacityHint:
          'Leave empty if attendance should be flexible.',
        tagsLabel: 'Tags',
        publishSettings: 'Publish Settings',
        posterUpload: 'Poster Upload',
        posterDescription:
          'Upload a strong visual for the event card and detail page. JPG, PNG, WEBP, and GIF are supported.',
        choosePoster: 'Choose poster image',
        maxPoster: 'Maximum size: 5 MB',
        posterPreviewEmpty:
          'Poster preview will appear here once you upload an image.',
        removePoster: 'Remove the current poster image',
        createSubmit: 'Create event',
        editSubmit: 'Save changes',
        saving: 'Saving event...',
        labels: {
          draft: 'Draft',
          published: 'Published',
          completed: 'Completed',
          cancelled: 'Cancelled',
        },
        descriptions: {
          draft: 'Save it without publishing yet.',
          published: 'Visible to students right away.',
          completed: 'Archive a finished event cleanly.',
          cancelled: 'Keep the page visible but mark it cancelled.',
        },
      },
      eventDetail: {
        back: 'Back to events',
        edit: 'Edit event',
        delete: 'Delete event',
        deleting: 'Deleting...',
        notFound: 'This event could not be found.',
        liveDemoReady: 'Live Demo Ready',
        liveDemoDescription:
          'A polished event detail experience with live room messaging and synchronized RSVP state.',
        liveRoomNotice: 'Live room notice',
        starts: 'Starts',
        ends: 'Ends',
        location: 'Location',
        organizer: 'Organizer',
        deleteTitle: 'Delete this event?',
        deleteMessage:
          'This will remove the event page, its chat history, and attendee records. This action cannot be undone.',
        statusPanel: 'Event Status',
        statusPanelDescription:
          'Organizers can move this event between draft, published, completed, and cancelled.',
        loadingTitle: 'Loading event detail',
        loadingMessage:
          'Preparing the live event room and RSVP state.',
      },
      calendar: {
        viewTitle: 'Calendar View',
        viewDescription:
          'A quick month snapshot for your course demo and report screenshots.',
        weekdays: {
          mon: 'Mon',
          tue: 'Tue',
          wed: 'Wed',
          thu: 'Thu',
          fri: 'Fri',
          sat: 'Sat',
          sun: 'Sun',
        },
        moreEvents: '+{{count}} more',
      },
      temporal: {
        upcoming: 'Upcoming',
        ongoing: 'Happening Now',
        ended: 'Event Ended',
        countdownPrefix: 'Starts in',
        days: 'd',
        hours: 'h',
        minutes: 'm',
        seconds: 's',
      },
      role: {
        student: 'Student',
        organizer: 'Organizer',
        admin: 'Admin',
      },
      toasts: {
        eventCreated: 'Event created',
        eventCreatedDescription:
          'Your event is live and ready for students to discover.',
        eventUpdated: 'Event updated',
        eventUpdatedDescription:
          'Your changes are live for students right away.',
        eventDeleted: 'Event deleted',
        eventDeletedDescription:
          'The event has been removed successfully.',
        statusUpdated: 'Status updated',
        statusUpdatedDescription:
          'Event status changed to {{status}}.',
        accountDeleted: 'Account deleted',
        accountDeletedDescription:
          'Removed {{events}} events, {{rsvps}} RSVPs, and {{messages}} messages.',
        registrationPendingTitle: 'Verify your email',
        registrationPendingDescription:
          'A verification code has been sent to {{email}}.',
        emailVerifiedTitle: 'Email verified',
        emailVerifiedDescription:
          'Your account is ready. Please log in to continue.',
        verificationResentTitle: 'Verification email sent',
        verificationResentDescription:
          'A new verification code was sent to {{email}}.',
        verificationResentErrorTitle: 'Unable to resend code',
        genericError: 'Please try again.',
      },
    },
  },
  'zh-CN': {
    translation: {
      common: {
        eventsync: '南开 EventSync',
        guest: '访客',
        loading: '加载中...',
        tryAgain: '重试',
        save: '保存',
        cancel: '取消',
        close: '关闭',
      },
      nav: {
        tagline: '校园活动，一站同步',
        home: '首页',
        dashboard: '控制台',
        events: '活动',
        createEvent: '创建活动',
        login: '登录',
        register: '注册',
        logout: '退出登录',
        language: '语言',
        deleteAccount: '删除账户',
      },
      auth: {
        welcomeBack: '欢迎回来',
        loginTitle: '登录',
        loginSubtitle:
          '使用你的 EventSync 账户访问受保护页面和实时活动面板。',
        loginSubmit: '登录',
        registerHero: '创建你的账户',
        registerTitle: '注册账户',
        registerSubtitle:
          '选择适合你的校园角色，注册后即可开始浏览活动。',
        registerSubmit: '注册',
        verifyEyebrow: '邮箱验证',
        verifyTitle: '请先验证你的邮箱，再登录。',
        verifyDescription:
          '我们已经向你的邮箱发送了 6 位验证码。输入验证码即可激活你的 EventSync 账户。',
        verifyFormTitle: '输入验证码',
        verifyFormSubtitle: '请使用收件箱中的验证码完成注册。',
        verifySubmit: '验证邮箱',
        verifyingButton: '验证中...',
        resendCode: '重新发送验证码',
        resendingCode: '重新发送中...',
        resendCodeHint:
          '如果还没有收到邮件，可以重新申请一个验证码。',
        resendCodeCountdown:
          '{{seconds}} 秒后可以再次申请新验证码。',
        resendCodeError: '当前无法重新发送验证码。',
        didNotReceiveCode: '没有收到验证码？',
        fullName: '姓名',
        email: '邮箱地址',
        password: '密码',
        confirmPassword: '确认密码',
        verificationCode: '验证码',
        verificationCodePlaceholder: '请输入 6 位验证码',
        verificationInstructionsTitle: '下一步操作',
        verificationInstructions:
          '打开你的邮箱，复制我们发送的 6 位验证码，并在过期前提交。',
        verificationError: '验证码验证失败，请检查后重试。',
        devOtpHint: '开发环境验证码：{{code}}',
        accountType: '账户类型',
        student: '学生',
        organizer: '组织者',
        studentDescription: '浏览活动并报名参加。',
        organizerDescription: '创建并管理活动页面。',
        alreadyRegistered: '已经注册？',
        loginInstead: '改为登录',
        needAccount: '还没有账户？',
        createOneHere: '立即注册',
        continueError: '操作失败，请重试。',
        signInHeroTitle: '登录后即可实时管理校园活动。',
        signInHeroDescription:
          'EventSync 帮助学生发现校园活动，也帮助组织者实时同步最新信息。',
        joinHeroTitle: '加入这个为校园精彩活动打造的平台。',
        joinHeroDescription:
          '学生可浏览和报名，组织者可发布并管理校园活动。',
      },
      home: {
        heroEyebrow: '公开活动中心',
        heroTitle: '无需登录，也能先看看南开正在发生什么。',
        heroDescription:
          '按分类浏览即将开始的活动，注册后即可报名、实时聊天并管理活动页面。',
        searchLabel: '搜索活动',
        searchPlaceholder: '按标题、地点或关键词搜索',
        categoryLabel: '分类筛选',
        allCategories: '全部分类',
        sectionDescriptionAcademic:
          '讲座、工作坊、科研分享和学习交流活动。',
        sectionDescriptionSports:
          '比赛、健身、团队训练和校园体育活动。',
        sectionDescriptionCultural:
          '艺术、社团、节庆、演出和文化展示活动。',
        sectionDescriptionOthers:
          '社区聚会、校园生活活动以及其他类型。',
        emptySearch: '当前搜索和筛选条件下没有匹配的活动。',
        emptyUpcomingTitle: '暂时还没有即将开始的活动。',
        emptyUpcomingMessage:
          '组织者发布活动后，已发布且即将开始的活动会显示在这里。',
        emptySearchTitle: '没有活动匹配你的搜索。',
        emptySearchMessage: '请尝试修改搜索词，或选择其他分类。',
        emptySection: '该分区暂时没有活动。',
        upcomingEvents: '场即将开始的活动',
        matchingEvents: '个匹配活动',
        browseAll: '查看全部活动',
        loginCta: '登录',
        registerCta: '注册',
      },
      recommendations: {
        title: '为你推荐',
        homeDescription:
          '根据你的 RSVP 历史、偏好分类和标签生成的 AI 辅助推荐。',
        dashboardHeading: '下一场适合你的校园活动',
        dashboardDescription:
          '这些推荐通过 Groq 上的 Llama 生成；如果 AI 不可用，系统会自动使用本地回退逻辑。',
        loadingTitle: '正在加载推荐',
        loadingMessage: '正在寻找符合你近期兴趣的活动。',
        errorTitle: '无法加载推荐',
        homeFeedErrorMessage:
          '当前无法加载活动。请稍后再试。',
        emptyTitle: '暂时没有推荐',
        emptyMessage:
          '先 RSVP 几场活动，EventSync 就能开始为你定制推荐。',
        noUpcomingTitle: '暂时没有即将开始的活动',
        noUpcomingMessage:
          '当前没有可显示的即将开始活动，请稍后再来看看。',
        starts: '开始时间',
        open: '查看详情',
      },
      categories: {
        academic: '学术',
        sports: '体育',
        artAndCulture: '艺术与文化',
        others: '其他',
      },
      dashboard: {
        eyebrow: '控制台',
        greeting: '你好，{{name}}。',
        description:
          '浏览活动、进入实时房间；如果你是组织者，还可以直接在这里发布和管理活动页面。',
        explore: '浏览活动',
        createEvent: '创建新活动',
        role: '角色：{{role}}',
        discover: '发现',
        discoverTitle: '实时活动流',
        discoverBody:
          '学生可以浏览最新校园活动，并进入实时活动详情页。',
        sync: '同步',
        syncTitle: '实时 RSVP + 聊天',
        syncBody:
          '房间消息和 RSVP 状态会在多个标签页之间几乎实时同步。',
        manage: '管理',
        manageTitle: '组织者工具',
        manageBodyOrganizer:
          '创建或编辑活动页面、上传海报，并随时保持活动信息最新。',
        manageBodyStudent:
          '组织者账户可以创建和编辑活动页面。',
        accountSettings: '账户设置',
        deleteTitle: '删除你的账户',
        deleteDescription:
          '此操作会永久删除你的账户。你创建的活动、RSVP、消息以及正在连接的实时房间都会被清理。',
        deleteButton: '删除账户',
        deletingButton: '正在删除账户...',
        deleteConfirmTitle: '确定永久删除账户？',
        deleteConfirmMessage:
          '此操作不可撤销。你的账户、RSVP、消息以及你创建的活动都会被删除。',
      },
      events: {
        eyebrow: '活动列表',
        title: '来自实时后端的校园活动',
        description:
          '浏览即将到来的活动，进入实时房间，并在一个精致页面中管理你创建的活动。',
        create: '创建活动',
        loadingTitle: '正在加载活动',
        loadingMessage: '正在从后端获取最新活动数据。',
        errorTitle: '无法加载活动',
        emptyTitle: '暂无已发布活动',
        emptyMessage:
          '当组织者创建活动后，它们会显示在这里。',
        openDetail: '查看实时详情',
        signInToViewDetails: '登录后查看详情',
        editEvent: '编辑活动',
        starts: '开始时间',
        noEvents: '暂无活动',
        searchPlaceholder: '按标题或地点搜索',
        organizerFilterPlaceholder: '按组织者 ID 筛选',
        allStatuses: '全部状态',
        fromDate: '开始日期',
        toDate: '结束日期',
        previousMonth: '上一个月',
        nextMonth: '下一个月',
        adminScope:
          '管理员视图会显示所有组织者在所选日期范围内的活动。',
        organizerScope:
          '组织者视图仅显示你在所选日期范围内创建的活动。',
        studentScope:
          '学生视图仅显示在所选日期范围内匹配的已发布活动。',
        adminTableEyebrow: '管理员控制',
        adminTableTitle: '跨组织者活动管理',
        adminTableDescription:
          '查看所有组织者的活动，应用筛选、更新状态，并直接在表格中删除任意活动。',
        adminTableEmptyTitle: '管理表中没有匹配的活动',
        adminTableEmptyMessage:
          '请调整组织者、状态或日期筛选条件。',
        tableEvent: '活动',
        tableOrganizer: '组织者',
        tableStatus: '状态',
        tableStarts: '开始',
        tableEnds: '结束',
        tableActions: '操作',
        tableOpen: '查看',
        tableDelete: '删除',
        tableDeleting: '删除中...',
        tableUpdating: '更新中...',
        tablePublish: '发布',
        tableMoveToDraft: '转为草稿',
        tableMarkCompleted: '标记已完成',
        tableCancelEvent: '取消活动',
        adminTableDeleteConfirmTitle:
          '确定从系统中删除该活动？',
        adminTableDeleteConfirmMessage:
          '这将把定于 {{date}} 的“{{title}}”从平台中永久移除，并删除其相关 RSVP 和聊天数据。',
        adminTableDeleteErrorTitle: '无法删除活动',
        adminTableDeleteErrorMessage:
          '无法删除该活动。请重试，或联系管理员。',
        adminTableStatusErrorTitle: '无法更新活动状态',
        adminTableStatusErrorMessage:
          '无法更新活动状态。请重试。',
      },
      eventForm: {
        createEyebrow: '创建活动',
        editEyebrow: '编辑活动',
        createTitle: '发布一个新的校园活动',
        editTitle: '更新你的活动页面',
        description:
          '填写学生需要的信息，选择发布状态，并上传一张有吸引力的海报。',
        titleLabel: '活动标题',
        descriptionLabel: '活动介绍',
        categoryLabel: '分类',
        locationLabel: '地点',
        startLabel: '开始时间',
        endLabel: '结束时间',
        timezoneLabel: '时区',
        capacityLabel: '最多人数',
        capacityHint:
          '如果人数不设上限，可以留空。',
        tagsLabel: '标签',
        publishSettings: '发布设置',
        posterUpload: '海报上传',
        posterDescription:
          '为活动卡片和详情页上传一张视觉效果更好的海报。支持 JPG、PNG、WEBP 和 GIF。',
        choosePoster: '选择海报图片',
        maxPoster: '最大 5 MB',
        posterPreviewEmpty:
          '上传图片后，这里会显示海报预览。',
        removePoster: '移除当前海报',
        createSubmit: '创建活动',
        editSubmit: '保存修改',
        saving: '正在保存活动...',
        labels: {
          draft: '草稿',
          published: '已发布',
          completed: '已结束',
          cancelled: '已取消',
        },
        descriptions: {
          draft: '先保存，不立即发布。',
          published: '立即向学生展示。',
          completed: '归档一个已完成的活动。',
          cancelled: '保留页面，但标记为已取消。',
        },
      },
      eventDetail: {
        back: '返回活动列表',
        edit: '编辑活动',
        delete: '删除活动',
        deleting: '正在删除...',
        notFound: '未找到该活动。',
        liveDemoReady: '演示已就绪',
        liveDemoDescription:
          '一个具有实时房间聊天和同步 RSVP 状态的精致活动详情体验。',
        liveRoomNotice: '实时房间提示',
        starts: '开始时间',
        ends: '结束时间',
        location: '地点',
        organizer: '组织者',
        deleteTitle: '确定删除此活动？',
        deleteMessage:
          '这会删除活动页面、聊天记录和报名记录，且无法撤销。',
        statusPanel: '活动状态',
        statusPanelDescription:
          '组织者可以在草稿、已发布、已结束和已取消之间切换。',
        loadingTitle: '正在加载活动详情',
        loadingMessage:
          '正在准备实时房间和 RSVP 状态。',
      },
      calendar: {
        viewTitle: '日历视图',
        viewDescription:
          '为你的课程演示和报告截图提供一个简洁的月度快照。',
        weekdays: {
          mon: '周一',
          tue: '周二',
          wed: '周三',
          thu: '周四',
          fri: '周五',
          sat: '周六',
          sun: '周日',
        },
        moreEvents: '+{{count}} 个更多活动',
      },
      temporal: {
        upcoming: '即将开始',
        ongoing: '正在进行',
        ended: '活动已结束',
        countdownPrefix: '距离开始还有',
        days: '天',
        hours: '时',
        minutes: '分',
        seconds: '秒',
      },
      role: {
        student: '学生',
        organizer: '组织者',
        admin: '管理员',
      },
      toasts: {
        eventCreated: '活动已创建',
        eventCreatedDescription:
          '你的活动已经发布，学生现在可以看到它。',
        eventUpdated: '活动已更新',
        eventUpdatedDescription:
          '你的修改已经生效。',
        eventDeleted: '活动已删除',
        eventDeletedDescription:
          '该活动已成功移除。',
        statusUpdated: '状态已更新',
        statusUpdatedDescription:
          '活动状态已切换为 {{status}}。',
        accountDeleted: '账户已删除',
        accountDeletedDescription:
          '已移除 {{events}} 个活动、{{rsvps}} 条 RSVP 和 {{messages}} 条消息。',
        registrationPendingTitle: '请验证你的邮箱',
        registrationPendingDescription:
          '新的验证码已发送到 {{email}}。',
        emailVerifiedTitle: '邮箱验证成功',
        emailVerifiedDescription:
          '你的账户已经可以使用，请登录继续。',
        verificationResentTitle: '验证邮件已发送',
        verificationResentDescription:
          '新的验证码已发送到 {{email}}。',
        verificationResentErrorTitle: '无法重新发送验证码',
        genericError: '请重试。',
      },
    },
  },
} as const;
