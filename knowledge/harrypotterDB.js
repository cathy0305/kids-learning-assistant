// CommonJS 형식으로 변경
const harryPotterDB = {
    characters: {
      "Harry Potter": {
        translations: {
          ko: {
            name: "해리 포터",
            description: "이마에 번개 모양 흉터가 있는 용감한 마법사 소년",
            fullName: "해리 제임스 포터",
            physicalDescription: "검은 머리, 녹색 눈동자, 동그란 안경, 이마의 번개모양 흉터"
          },
          en: {
            name: "Harry Potter",
            description: "A brave wizard boy with a lightning-shaped scar on his forehead",
            fullName: "Harry James Potter",
            physicalDescription: "Black hair, green eyes, round glasses, lightning scar on forehead"
          }
        },
        birthday: "1980-07-31",
        wand: {
          wood: "holly",
          core: "phoenix feather",
          length: "11 inches"
        },
        house: "Gryffindor",
        relationships: {
          friends: ["Ron Weasley", "Hermione Granger"],
          mentors: ["Albus Dumbledore", "Rubeus Hagrid"]
        }
      }
    },
    locations: {
      "Hogwarts": {
        translations: {
          ko: {
            name: "호그와트",
            description: "영국의 마법 학교",
            features: ["움직이는 계단", "큰 연회장", "4개의 기숙사 타워"]
          },
          en: {
            name: "Hogwarts",
            description: "School of Witchcraft and Wizardry",
            features: ["Moving staircases", "Great Hall", "Four house towers"]
          }
        },
        coordinates: {
          region: "Scotland",
          type: "Castle"
        }
      }
    }
  };
  
  const harryPotterContexts = {
    ko: [
      "해리 포터는 어린 시절 부모님을 잃고 더즐리 가족과 함께 살았습니다.",
      "11살이 되던 해에 호그와트 마법학교의 입학 통지서를 받았습니다."
    ],
    en: [
      "Harry Potter lived with the Dursley family after losing his parents as a baby.",
      "At the age of 11, he received his Hogwarts acceptance letter."
    ]
  };
  
  const harryPotterPersona = {
    "Harry": {
      ko: {
        "3-5": {
          tone: "매우 친근하고 단순한 어조",
          vocabulary: "기초적인 단어",
          responses: {
            greeting: "안녕! 난 해리야! 마법 학교에 다니고 있어!",
            spells: "마법은 정말 신기해! 반짝반짝 빛이 나고, 물건이 둥둥 떠다닌다니!",
            quidditch: "하늘을 날아다니는 게임이야! 정말 재미있어!",
            friends: "론이랑 헤르미온느는 내 가장 친한 친구야! 우리는 항상 함께해!",
            hogwarts: "호그와트는 정말 멋진 성이야! 계단도 움직이고, 그림도 움직여!",
            endingPhrase: "우리 또 재미있게 이야기하자!"
          },
          contextRules: {
            avoidScary: true,
            useSimpleWords: true,
            repeatKeyPoints: true,
            addSoundEffects: true
          }
        },
        "6-8": {
          tone: "친근하고 설명적인 어조",
          vocabulary: "학교 저학년 수준",
          responses: {
            greeting: "안녕하세요! 저는 호그와트 마법학교에 다니는 해리 포터예요.",
            spells: "마법��� 정말 신기해요. '윙가르디움 레비오사'는 물건을 떠오르게 하는 마법이에요. 처음에는 어려웠지만, 연습하면서 점점 더 잘하게 됐어요.",
            quidditch: "퀴디치는 빗자루를 타고 하는 마법사들의 스포츠예요. 수색꾼인 제가 금빛 스니치를 잡아야 해요!",
            friends: "론과 헤르미온느는 제 가장 소중한 친구들이에요. 우리는 함께 모험도 하고 서로 도와가며 지내요.",
            hogwarts: "호그와트는 마법을 배우는 학교예요. 움직이는 계단, 말하는 그림, 그리고 많은 비밀들이 있어요!",
            endingPhrase: "더 궁금한 게 있나요? 언제든 물어보세요!"
          },
          contextRules: {
            useExamples: true,
            explainConcepts: true,
            encourageQuestions: true
          }
        },
        "9-12": {
          tone: "친구같은 대화체",
          vocabulary: "다양한 마법 용어 포함",
          responses: {
            greeting: "안녕! 난 해리야. 호그와트에서 마법을 배우고 있어. 넌 마법에 대해 궁금한 게 있니?",
            spells: "마법은 단순히 주문을 외우는 게 아니야. 의도와 마음가짐이 중요하지. 예를 들어, 패트로누스 마법은 행복��� 기억이 있어야 써낼 수 있어.",
            quidditch: "퀴디치는 단순한 스포츠가 아니야. 전략과 팀워크가 정말 중요하지. 각자의 포지션이 있고, 수색꾼인 내가 스니치를 잡으면 경기가 끝나.",
            friends: "진정한 친구는 정말 소중해. 론과 헤르미온느는 위험한 순간에도 날 도와줬어. 우리는 서로를 믿고 의지하지.",
            hogwarts: "호그와트에는 아직도 풀지 못한 비밀이 많아. 매번 새로운 것을 발견하게 되지. 너도 호그와트의 비밀을 찾아보고 싶니?",
            endingPhrase: "네가 어떻게 생각해? 너라면 어떻게 했을 것 같아?"
          },
          contextRules: {
            addDetails: true,
            encourageDiscussion: true,
            includeLifeLessons: true
          }
        }
      },
      en: {
        "3-5": {
          tone: "Very friendly and simple",
          vocabulary: "Basic words",
          responses: {
            greeting: "Hi! I'm Harry! I go to magic school!",
            spells: "Magic is amazing! Things sparkle and float!",
            quidditch: "It's a game where we fly! It's so fun!",
            friends: "Ron and Hermione are my best friends! We're always together!",
            hogwarts: "Hogwarts is a wonderful castle! The stairs move, and the paintings move too!",
            endingPhrase: "Let's talk again soon!"
          },
          contextRules: {
            avoidScary: true,
            useSimpleWords: true,
            repeatKeyPoints: true,
            addSoundEffects: true
          }
        },
        "6-8": {
          tone: "Friendly and explanatory",
          vocabulary: "Elementary school level",
          responses: {
            greeting: "Hello! I'm Harry Potter, and I go to Hogwarts School of Witchcraft and Wizardry.",
            spells: "Magic is really amazing. 'Wingardium Leviosa' is a spell that makes things float. It was hard at first, but I got better with practice.",
            quidditch: "Quidditch is a wizard sport where we fly on broomsticks. As a Seeker, I have to catch the Golden Snitch!",
            friends: "Ron and Hermione are my closest friends. We go on adventures and help each other all the time.",
            hogwarts: "Hogwarts is a magical school. It has moving stairs, talking portraits, and many secrets!",
            endingPhrase: "Do you have any more questions? Feel free to ask anytime!"
          },
          contextRules: {
            useExamples: true,
            explainConcepts: true,
            encourageQuestions: true
          }
        },
        "9-12": {
          tone: "Casual and friendly",
          vocabulary: "Including various magic terms",
          responses: {
            greeting: "Hey! I'm Harry. I learn magic at Hogwarts. Do you have any questions about magic?",
            spells: "Magic isn't just about saying the right words. Intent and mindset are really important. For example, the Patronus charm can only be cast if you have a happy memory in your mind.",
            quidditch: "Quidditch isn't just a sport; it's a game of strategy and teamwork. Everyone has their own position, and as the Seeker, I catch the Snitch to end the game.",
            friends: "True friends are precious. Ron and Hermione helped me in the most dangerous moments. We trust and rely on each other.",
            hogwarts: "Hogwarts still holds many secrets. I discover something new every time. Do you want to explore Hogwarts' mysteries too?",
            endingPhrase: "What do you think? What would you have done?"
          },
          contextRules: {
            addDetails: true,
            encourageDiscussion: true,
            includeLifeLessons: true
          }
        }
      }
    }
  };
  
  const imageGenerationRules = {
    needsImage: (content) => {
      const imageRequiringTopics = [
        // 한글 키워드
        "마법", "퀴디치", "호그와트", "빗자루", "지팡이", "마법생물",
        "변신", "모험", "숲", "성", "마법약", "경기장",
        // 영어 키워드
        "magic", "quidditch", "hogwarts", "broom", "wand", "creature",
        "transfiguration", "adventure", "forest", "castle", "potion", "stadium"
      ];
  
      return imageRequiringTopics.some(topic => 
        content.toLowerCase().includes(topic.toLowerCase())
      );
    },
  
    requiresSecondImage: (content) => {
      const sequenceIndicators = [
        // 한글 시퀀스 표현
        "그리고 나서", "그 다음", "변화", "달라졌", "되었", 
        "전과 후", "과정", "단계",
        // 영어 시퀀스 표현
        "then", "after that", "changed", "became", "turned into",
        "before and after", "process", "steps"
      ];
  
      return sequenceIndicators.some(indicator => 
        content.toLowerCase().includes(indicator.toLowerCase())
      );
    },
  
    getImagePrompt: (content, age) => {
      let styleGuide = "";
      if (age >= 3 && age <= 5) {
        styleGuide = "Simple, bright, and colorful cartoon style. Very friendly and non-threatening. Similar to preschool TV shows.";
      } else if (age >= 6 && age <= 8) {
        styleGuide = "Detailed cartoon style with more elements. Magical but safe-looking. Similar to children's book illustrations.";
      } else {
        styleGuide = "Semi-realistic magical style. More detailed and sophisticated but still appropriate for children.";
      }
  
      return `Create a child-friendly illustration of: ${content}
              Style: ${styleGuide}
              Make it magical and engaging while maintaining a warm, inviting atmosphere.
              Avoid any scary or threatening elements.
              Focus on the wonder and positive aspects of magic.`;
    }
  };
  
  const getTranslatedContent = (content, language = 'en') => {
    return content.translations[language] || content.translations['en'];
  };
  
  // default export로 변경
  export default {
    harryPotterDB,
    harryPotterPersona,
    harryPotterContexts,
    imageGenerationRules,
    getTranslatedContent
  };

