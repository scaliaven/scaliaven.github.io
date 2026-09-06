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
          description: "Coursework and research projects",
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
        },{id: "nav-cv",
          title: "cv",
          description: "Education, research experience, selected projects, and awards. Also available as a PDF.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "cv-general-information",
        title: "General Information",
        description: "CV",
        section: "CV",
        handler: () => {
          window.location.href = "/cv/#cv-general-information";
        },
      },{id: "cv-education",
        title: "Education",
        description: "CV",
        section: "CV",
        handler: () => {
          window.location.href = "/cv/#cv-education";
        },
      },{id: "cv-research-experience",
        title: "Research Experience",
        description: "CV",
        section: "CV",
        handler: () => {
          window.location.href = "/cv/#cv-research-experience";
        },
      },{id: "cv-selected-projects",
        title: "Selected Projects",
        description: "CV",
        section: "CV",
        handler: () => {
          window.location.href = "/cv/#cv-selected-projects";
        },
      },{id: "cv-honors-and-awards",
        title: "Honors and Awards",
        description: "CV",
        section: "CV",
        handler: () => {
          window.location.href = "/cv/#cv-honors-and-awards";
        },
      },{id: "cv-technical-skills",
        title: "Technical Skills",
        description: "CV",
        section: "CV",
        handler: () => {
          window.location.href = "/cv/#cv-technical-skills";
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
    },{id: "news-i-become-a-research-assistant-for-professor-shengjie-wang-nyu-shanghai",
          title: 'I become a Research assistant for Professor Shengjie Wang @NYU Shanghai 🎉🎉🎉',
          description: "",
          section: "News",},{id: "news-i-started-to-work-as-a-research-intern-umd-for-summer-2025-under-the-supervision-of-professor-tianyi-zhou-and-professor-furong-huang",
          title: 'I started to work as a Research Intern @UMD for summer 2025, under...',
          description: "",
          section: "News",},{id: "news-i-started-the-msr-program-at-the-cmu-robotics-institute",
          title: 'I started the MSR program at the CMU Robotics Institute 🎉🎉🎉',
          description: "",
          section: "News",},{id: "news-i-joined-the-robotic-caregiving-and-human-interaction-rchi-lab-at-the-cmu-robotics-institute-working-with-professor-zackory-erickson",
          title: 'I joined the Robotic Caregiving and Human Interaction (RCHI) Lab at the CMU...',
          description: "",
          section: "News",},{id: "projects-youtube-view-forecasting",
          title: 'YouTube View Forecasting',
          description: "Predicting 30-day view counts from what happens on screen, cutting error 26.5% below a views-only baseline",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_project/";
            },},{id: "projects-music-classification-from-spectrograms",
          title: 'Music Classification from Spectrograms',
          description: "Treating vocal spectrograms as greyscale images: an ensemble that reached 83.04% test accuracy",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_project/";
            },},{id: "projects-cost-aware-finetuning-for-retrosynthesis",
          title: 'Cost-aware Finetuning for Retrosynthesis',
          description: "Cutting both the data cost and the compute cost of predicting reactants from products",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_project/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%68%6F%6E%67%6A%69%61%68@%61%6E%64%72%65%77.%63%6D%75.%65%64%75", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0009-0007-7627-0102", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/scaliaven", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/hongjia-alex-huang-166165262", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
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
