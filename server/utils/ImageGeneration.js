class ImageGenerationSystem {
    constructor() {
      // Keep the existing style definitions as reference guidelines
      this.ageStyles = {
        "3-5": {
          visualStyle: {
            composition: "Simple and clear with single focal point",
            colors: "Bright and cheerful primary colors",
            shapes: "Rounded and soft forms",
            mood: "Warm and friendly"
          }
        },
        "6-9": {
          visualStyle: {
            composition: "Clear storytelling with balanced elements",
            colors: "Rich and vibrant color palette",
            shapes: "Dynamic but approachable forms",
            mood: "Adventurous and engaging"
          }
        },
        "10-12": {
          visualStyle: {
            composition: "Sophisticated with multiple points of interest",
            colors: "Deep and nuanced color palette",
            shapes: "Detailed and realistic forms",
            mood: "Mysterious and dramatic"
          }
        }
      };
  
      // Visual reference elements for different settings
      this.visualElements = {
        interior: {
          classroom: ["desks", "windows", "magical equipment"],
          library: ["bookshelves", "study areas", "floating books"],
          hall: ["long tables", "enchanted ceiling", "grand architecture"]
        },
        exterior: {
          grounds: ["gardens", "practice areas", "pathways"],
          castle: ["towers", "courtyards", "magical barriers"],
          nature: ["magical creatures", "enchanted plants", "weather effects"]
        }
      };
    }
  
    generatePrompt(serverResponse, age) {
      const ageGroup = this.determineAgeGroup(age);
      const style = this.ageStyles[ageGroup];
      
      // Extract core scene elements from server response
      const sceneElements = this.parseSceneElements(serverResponse);
      
      // 프롬프트 문자열로 변환하여 반환
      const visualStyleStr = Object.entries(style.visualStyle)
        .map(([key, value]) => `${value}`).join('. ');
      
      const promptStr = `Create a children's illustration with these specifications:
        Main Action: ${sceneElements.action}
        Setting: ${sceneElements.location}
        Atmosphere: ${sceneElements.mood}
        Time: ${sceneElements.time}
        Visual Style: ${visualStyleStr}
        Key Elements: ${sceneElements.keyElements.join(', ')}
        
        Rules:
        - Do not include any text or writing in the image
        - Focus on clear visual storytelling
        - Maintain age-appropriate content
        - Create original designs distinct from existing properties`;

      return promptStr;
    }
  
    parseSceneElements(response) {
      // Enhanced scene parsing focusing on visual elements
      const elements = {
        action: '',
        location: '',
        mood: '',
        time: 'day',
        keyElements: []
      };
  
      // Extract primary action
      const actionMatch = response.match(/([가-힣a-zA-Z]+(?:하고|하며|하는|ing|does|did|doing)[가-힣a-zA-Z\s]+)/);
      if (actionMatch) {
        elements.action = actionMatch[1];
      }
  
      // Identify location
      const locationMatch = response.match(/(?:에서|안에서|at|in|inside)([가-힣a-zA-Z\s]+)(?=[\s\.,])/);
      if (locationMatch) {
        elements.location = locationMatch[1];
      }
  
      // Detect mood indicators
      const moodWords = {
        happy: /즐겁|행복|happy|joyful/i,
        exciting: /신나|흥분|exciting|thrilling/i,
        mysterious: /신비|미스터리|mysterious|magical/i,
        peaceful: /평화|조용|peaceful|quiet/i
      };
  
      for (const [mood, pattern] of Object.entries(moodWords)) {
        if (pattern.test(response)) {
          elements.mood = mood;
          break;
        }
      }
  
      // Extract key visual elements
      const visualMatches = response.match(/([가-힣a-zA-Z]+(?:이|가|을|를|와|과|and|with)[가-힣a-zA-Z\s]+)/g);
      if (visualMatches) {
        elements.keyElements = visualMatches
          .map(match => match.trim())
          .filter(element => element.length > 0)
          .slice(0, 3); // Keep top 3 key elements
      }
  
      return elements;
    }
  
    determineAgeGroup(age) {
      const numAge = parseInt(age);
      if (numAge >= 3 && numAge <= 5) return "3-5";
      if (numAge >= 6 && numAge <= 9) return "6-9";
      return "10-12";
    }
  
    needsImage(content) {
      const visualIndicators = [
        "보여", "그림", "장면", "모습",
        "show", "scene", "view", "looks like"
      ];
      return visualIndicators.some(indicator => 
        content.toLowerCase().includes(indicator.toLowerCase())
      );
    }
  
    getSceneTransition(content) {
      // Check for scene transition indicators
      const transitionWords = [
        "변화", "전환", "바뀌", "달라",
        "change", "transform", "become", "turn"
      ];
      
      for (const word of transitionWords) {
        if (content.includes(word)) {
          const sentences = content.split(/[.!?]/).map(s => s.trim());
          const transitionIndex = sentences.findIndex(s => s.includes(word));
          
          if (transitionIndex !== -1) {
            return {
              before: sentences.slice(0, transitionIndex).join('. '),
              after: sentences.slice(transitionIndex).join('. ')
            };
          }
        }
      }
      
      return null;
    }
  }
  
  export const imageGenerationSystemInstance = new ImageGenerationSystem();