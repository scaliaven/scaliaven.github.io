// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "Coursework and Research Projects",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-repositories",
          title: "repositories",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "post-cifar-10-classification-using-resnet",
      
        title: "CIFAR-10 Classification using ResNet",
      
      description: "A project on CIFAR-10 classification using ResNet.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/cifar/";
        
      },
    },{id: "post-effect-of-masks-on-indoor-classroom-covid-19-transmission",
      
        title: "Effect of Masks on Indoor Classroom Covid-19 Transmission",
      
      description: "This is the final project for IMM.",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/IMM/";
        
      },
    },{id: "post-introduction",
      
        title: "Introduction",
      
      description: "what I am going to do",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/introduction/";
        
      },
    },{id: "news-i-become-a-research-assistant-for-professor-shengjie-wang",
          title: 'I become a Research assistant for Professor Shengjie Wang 🎉🎉🎉',
          description: "",
          section: "News",},{id: "news-i-started-to-work-as-a-research-intern-umd-for-summer-2025-under-the-supervision-of-professor-tianyi-zhou-and-professor-furong-huang",
          title: 'I started to work as a Research Intern @UMD for summer 2025, under...',
          description: "",
          section: "News",},{id: "projects-video-recognition",
          title: 'Video Recognition',
          description: "Summer Research Project on Video Popularity Prediction",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_project/";
            },},{id: "projects-audio-classification",
          title: 'Audio Classification',
          description: "Machine Learning Final Project",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_project/";
            },},{id: "projects-chemical-reaction-prediction",
          title: 'Chemical Reaction Prediction',
          description: "Course Project on Natural Language Processing",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_project/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%68%68%33%30%34%33@%6E%79%75.%65%64%75", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/scaliaven", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
