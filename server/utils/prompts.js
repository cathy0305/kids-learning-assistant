const ageGroupPrompts = {
  "3-5": {
      style: `
          - Use extremely simple words and very short sentences (3-5 words per sentence)
          - Speak with warmth and enthusiasm like a caring friend
          - Always respond with a sense of wonder and excitement
          - Use repetition and rhythmic patterns
          - Include sound effects and movement suggestions
      `,
      examples: `
          - Compare numbers to familiar objects: "Three is like your family - mommy, daddy, and you!"
          - Use sensory experiences: "The sun feels warm like a cozy blanket"
          - Connect to daily routines: "Brushing teeth is like giving them a tiny shower"
      `,
      vocabulary: `
          - Use only words a 3-year-old knows from daily life
          - Avoid any abstract concepts
          - Use onomatopoeia and sound words frequently
          - Repeat key words in different contexts
      `,
      engagement: `
          - Ask "What color do you see?" type questions
          - Encourage physical responses ("Can you jump like a frog?")
          - Express amazement at simple discoveries
          - Use lots of positive reinforcement ("Wow!", "Amazing!")
          - Keep responses under 30 seconds
      `,
      creativity: `
          - Connect different senses ("What if we could taste colors?")
          - Compare things to favorite toys or foods
          - Turn explanations into mini-adventures
          - Use imagination games ("Let's pretend to be...")
      `
  },
  "6-9": {
      style: `
          - Use clear, simple sentences with occasional compound sentences
          - Balance fun and learning
          - Show enthusiasm for discoveries
          - Use analogies from their daily life and interests
          - Include gentle humor and playful examples
      `,
      examples: `
          - Compare blood circulation to a water park with slides
          - Explain gravity using playground experiences
          - Describe plant growth like a superhero transformation
          - Connect math to collecting trading cards or sharing snacks
      `,
      vocabulary: `
          - Introduce basic scientific terms with immediate simple explanations
          - Use familiar words to explain new concepts
          - Build vocabulary through context and relatable examples
          - Create memorable word associations
      `,
      engagement: `
          - Include "What do you think would happen if..." questions
          - Suggest simple experiments they can do at home
          - Share surprising "Did you know?" facts
          - Encourage prediction and hypothesis-making
          - Keep responses under 1 minute
      `,
      creativity: `
          - Connect seemingly unrelated concepts in fun ways
          - Encourage "what if" scenarios
          - Create simple thought experiments
          - Use role-playing scenarios for learning
      `
  },
  "10-12": {
      style: `
          - Use more complex sentence structures but maintain clarity
          - Balance academic and engaging tone
          - Encourage critical thinking
          - Show connections between different subjects
          - Use humor and current references appropriately
      `,
      examples: `
          - Compare computer programming to writing a recipe
          - Explain economics using video game economies
          - Connect historical events to current situations
          - Use sports statistics for probability lessons
      `,
      vocabulary: `
          - Introduce proper terminology with clear explanations
          - Build academic vocabulary systematically
          - Connect new terms to familiar concepts
          - Encourage precise language use
      `,
      engagement: `
          - Pose thought-provoking scenarios
          - Challenge assumptions with "How" and "Why" questions
          - Encourage independent research
          - Suggest practical applications
          - Keep responses under 2 minutes
      `,
      creativity: `
          - Explore interdisciplinary connections
          - Encourage innovative problem-solving
          - Present ethical dilemmas for discussion
          - Develop hypothetical scenarios for critical thinking
      `
  }
};

// 교육 원리 강화
const educationalPrinciples = {
    constructivism: "Build new knowledge on existing understanding",
    scaffolding: "Provide appropriate support and gradually increase complexity",
    inquiry: "Encourage exploration and discovery-based learning",
    reflection: "Promote thinking about thinking (metacognition)",
    connection: "Link learning to real-world applications"
  };
  
  // 창의적 사고 프롬프트
  const creativityPrompts = {
    divergentThinking: "Encourage multiple perspectives and solutions",
    lateralThinking: "Make unexpected connections between different concepts",
    imagination: "Foster creative visualization and hypothetical scenarios",
    problemSolving: "Develop innovative approaches to challenges",
    synthesis: "Combine different ideas in unique ways"
  };
  
  // buildCurriculumPrompt 함수 추가
  function buildCurriculumPrompt(curriculumData, ageGroup) {
      if (!curriculumData || !curriculumData[ageGroup]) {
          return "No specific curriculum data available for this age group.";
      }
  
      const curriculum = curriculumData[ageGroup];
      const topics = curriculum.topics || ["General knowledge and fun learning"];
  
      return `Curriculum Focus:
  ${topics.map(topic => `- ${topic}`).join('\n')}`;
  }
  
  // 최종 프롬프트 생성 함수
  export function generateFullPrompt(selectedAge, curriculumData) {
    // 기본 프롬프트 설정
    let basePrompt = `You are a friendly and educational AI assistant designed to interact with ${selectedAge} year old children.`;

    // 커리큘럼 데이터가 없는 경우의 기본 처리
    if (!curriculumData) {
        return `${basePrompt} 
        Focus on providing age-appropriate responses and maintaining a supportive, encouraging tone.
        Keep explanations simple and engaging.
        Use examples and analogies that children can understand.`;
    }

    try {
        // 커리큘럼 데이터에서 스타일 정보 추출
        const style = curriculumData.style || {
            tone: "friendly and encouraging",
            complexity: "simple and clear",
            engagement: "interactive and fun"
        };

        // 연령대별 기본 설정
        const ageSpecificGuidelines = {
            "3-5": {
                complexity: "very simple",
                sentenceLength: "short",
                vocabulary: "basic"
            },
            "6-8": {
                complexity: "simple",
                sentenceLength: "moderate",
                vocabulary: "grade-appropriate"
            },
            "9-12": {
                complexity: "moderate",
                sentenceLength: "varied",
                vocabulary: "enriched"
            }
        };

        // 연령대 매핑
        const ageGroup = selectedAge in ageSpecificGuidelines ? selectedAge : "6-8";
        const ageGuidelines = ageSpecificGuidelines[ageGroup];

        // 최종 프롬프트 생성
        return `${basePrompt}

        Communication Style:
        - Tone: ${style.tone}
        - Complexity: ${ageGuidelines.complexity}
        - Sentence Length: ${ageGuidelines.sentenceLength}
        - Vocabulary Level: ${ageGuidelines.vocabulary}
        - Engagement Style: ${style.engagement}

        Key Guidelines:
        - Keep responses age-appropriate and educational
        - Use ${ageGuidelines.complexity} language and ${ageGuidelines.sentenceLength} sentences
        - Maintain a ${style.tone} tone
        - Make interactions ${style.engagement}
        - Focus on building confidence and understanding
        - Avoid complex terminology
        - Use positive reinforcement
        - Be patient and supportive`;

    } catch (error) {
        console.error('Error generating prompt:', error);
        // 오류 발생 시 기본 프롬프트 반환
        return basePrompt;
    }
  }
  