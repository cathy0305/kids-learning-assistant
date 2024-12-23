import { OpenAI } from 'openai';

class ImageGenerationSystem {
    constructor() {
        // OpenAI 클라이언트 초기화
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });


// Detailed character database
        this.characterDatabase = {
            "Harry Potter": {
                physicalAppearance: {
                    face: "Round face with a distinctive lightning bolt scar on forehead",
                    hair: "Perpetually messy jet-black hair that sticks up at the back",
                    eyes: "Bright emerald green eyes, inherited from his mother",
                    bodyType: "Initially small and skinny for his age, grows into an average build",
                    age: "Ages from 11 to 17 throughout the series"
                },
                distinctiveFeatures: {
                    facial: "Lightning bolt scar, round glasses with black frames",
                    expressions: "Often shows determination or curiosity in his expression"
                },
                clothing: {
                    casual: "Oversized hand-me-down clothes when not in school",
                    uniform: "Gryffindor robes with red and gold trim, black wizard robes",
                    accessories: "Wand made of holly with phoenix feather core, round wire-rimmed glasses"
                },
                movement: "Quick and agile movements, especially when flying",
                uniqueElements: "Carries his wand and often has his owl Hedwig nearby"
            },
            "Hermione Granger": {
                physicalAppearance: {
                    face: "Heart-shaped face with determined expression",
                    hair: "Very bushy brown hair that becomes slightly sleeker with age",
                    eyes: "Brown eyes with an intense, focused gaze",
                    bodyType: "Average height and build",
                    age: "Ages from 11 to 17 throughout the series"
                },
                distinctiveFeatures: {
                    facial: "Initially had larger front teeth until magically corrected",
                    expressions: "Often shows concentration or thoughtfulness"
                },
                clothing: {
                    casual: "Neat, practical Muggle clothing",
                    uniform: "Perfectly maintained Gryffindor uniform, prefect badge",
                    accessories: "Always carries multiple books, vine wood wand with dragon heartstring"
                },
                movement: "Precise and purposeful movements, excellent posture",
                uniqueElements: "Often seen with books in hand or performing complex wand movements"
            },
            "Ron Weasley": {
                physicalAppearance: {
                    face: "Long nose, freckled face",
                    hair: "Bright red hair, characteristic of all Weasleys",
                    eyes: "Blue eyes",
                    bodyType: "Tall and lanky, grows to be one of the tallest in the group",
                    age: "Ages from 11 to 17 throughout the series"
                },
                distinctiveFeatures: {
                    facial: "Prominent freckles across nose and cheeks",
                    expressions: "Often shows either enthusiasm or nervousness"
                },
                clothing: {
                    casual: "Hand-me-down clothes, maroon sweaters from his mother",
                    uniform: "Often slightly worn Gryffindor robes",
                    accessories: "Initially had a broken wand, later willow and unicorn hair wand"
                },
                movement: "Somewhat gangly, especially after growth spurts",
                uniqueElements: "Pet rat Scabbers (early years)/miniature owl Pigwidgeon (later years)"
            }
        };


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
  
    async parseSceneElements(response) {
        const elements = {
            action: '',
            location: '',
            mood: '',
            time: 'day',
            keyElements: [],
            characters: []
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
                .slice(0, 3);
        }
  
        // GPT를 사용하여 캐릭터 특징 실시간 분석
        const characterNames = this.extractCharacterNames(response);
        if (characterNames.length > 0) {
            const characterTraits = await this.analyzeCharacterTraits(characterNames);
            elements.characters = characterTraits;
        }
  
        // 답변 내용 분석
        const sceneAnalysis = await this.analyzeSceneContent(response);
        elements.sceneDescription = sceneAnalysis;
  
        return elements;
    }
  
    extractCharacterNames(text) {
        // 해리포터 시리즈의 주요 캐릭터 이름 패턴
        const namePatterns = [
            /해리\s*포터|[Hh]arry\s*[Pp]otter/,
            /헤르미온느|[Hh]ermione\s*[Gg]ranger/,
            /론|로널드|[Rr]on(?:ald)?\s*[Ww]easley/,

            // 교수진
            /덤블도어|[Dd]umbledore/,
            /스네이프|[Ss]nape/,
            /맥고나걸|[Mm]c[Gg]onagall/,

            // 학생들
            /말포이|드레이코|[Dd]raco\s*[Mm]alfoy/,
            /네빌|롱바텀|[Nn]eville\s*[Ll]ongbottom/,
            /지니|진|[Gg]inny\s*[Ww]easley/,
            /루나|[Ll]una\s*[Ll]ovegood/,

            // 기타 주요 인물
            /시리우스|블랙|[Ss]irius\s*[Bb]lack/,
            /해그리드|[Hh]agrid/,
            /볼드모트|[Vv]oldemort/
        ];
  
        return namePatterns
            .map(pattern => {
                const match = text.match(pattern);
                return match ? match[0] : null;
            })
            .filter(name => name !== null);
    }
  
    async analyzeCharacterTraits(characterNames) {
        try {
            const traits = characterNames.map(name => {
                // Standardize character name format for matching
                const standardizedName = name.toLowerCase().trim();
                
                // Find matching character in database
                const characterEntry = Object.entries(this.characterDatabase).find(([key, _]) => 
                    key.toLowerCase().includes(standardizedName)
                );

                if (!characterEntry) return null;

                const [_, characterData] = characterEntry;

                // Create a comprehensive visual description from the stored data
                const visualDescription = `
                    ${characterData.physicalAppearance.face}. 
                    ${characterData.physicalAppearance.hair}. 
                    ${characterData.physicalAppearance.eyes}. 
                    ${characterData.physicalAppearance.bodyType}. 
                    Distinctive features: ${characterData.distinctiveFeatures.facial}. 
                    Typically shows ${characterData.distinctiveFeatures.expressions}. 
                    Wears ${characterData.clothing.uniform}. 
                    Moves with ${characterData.movement}. 
                    ${characterData.uniqueElements}.`.replace(/\s+/g, ' ').trim();

                return {
                    name: name,
                    traits: visualDescription
                };
            }).filter(trait => trait !== null);

            return traits;
        } catch (error) {
            console.error('Character analysis error:', error);
            return [];
        }
    }
  
    async analyzeSceneContent(response) {
        const analysisPrompt = `
            Analyze this scene and describe ONLY what is physically happening:
            "${response}"
            
            Focus on:
            1. The actual actions and movements
            2. Visual interactions between characters
            3. Physical descriptions of the environment
            4. Observable emotions and expressions
            
            Provide a clear, visual description without any dialogue or internal thoughts.
            Describe only what can be seen in a single moment or scene.`;
  
        try {
            const analysis = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{
                    role: "user",
                    content: analysisPrompt
                }],
                temperature: 0.7
            });
  
            return analysis.choices[0].message.content.trim();
        } catch (error) {
            console.error('장면 분석 중 오류:', error);
            return '';
        }
    }
  
    async generatePrompt(serverResponse, age) {
        const ageGroup = this.determineAgeGroup(age);
        const style = this.ageStyles[ageGroup];
        const sceneElements = await this.parseSceneElements(serverResponse);
        
        // 답변에서 실제 일어나는 상황만 추출
        let mainScene = sceneElements.sceneDescription || '';
        
        // 캐릭터가 있는 경우, 캐릭터의 행동과 상호작용을 포함
        const characterActions = sceneElements.characters && sceneElements.characters.length > 0
            ? sceneElements.characters
                .map(char => `A character who looks like: ${char.traits}`)
                .join('\n')
            : '';
        
        const promptStr = `Create this specific scene:
            ${mainScene}

            ${characterActions ? `With these characters:\n${characterActions}` : ''}
            
            Visual style:
            - ${style.visualStyle.mood} atmosphere
            - ${style.visualStyle.colors}
            - ${style.visualStyle.composition}
            
            Must follow:
            - Focus only on the described action and scene
            - No text or symbols
            - Natural and dynamic composition
            - Do not include any instructional elements
            - Create only what is happening in the scene`;

        return promptStr;
    }
  
    determineAgeGroup(age) {
        const numAge = parseInt(age);
        if (numAge >= 3 && numAge <= 5) return "3-5";
        if (numAge >= 6 && numAge <= 9) return "6-9";
        return "10-12";
    }
  
    needsImage(content) {
        // 빈 문자열이나 undefined 체크
        if (!content || typeof content !== 'string') {
            console.log('컨텐츠가 없거나 문자열이 아님:', content);
            return false;
        }

        const contentLength = content.trim().length;
        console.log('컨텐츠 길이:', contentLength);

        // 30자 이상이면 무조건 true 환
        if (contentLength >= 30) {
            console.log('30자 이상이므로 이미지 생성 필요');
            return true;
        }

        const visualIndicators = [
            "보여", "그림", "장면", "���습",
            "show", "scene", "view", "looks like"
        ];
        
        const hasVisualIndicator = visualIndicators.some(indicator => 
            content.toLowerCase().includes(indicator.toLowerCase())
        );

        console.log('시각적 표현 포함 여부:', hasVisualIndicator);
        return hasVisualIndicator;
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
  
    requiresSecondImage(content) {
        // 장면 전환이 있는지 확인
        const transitionWords = ["변화", "전환", "바뀌", "달라", "change", "transform", "become", "turn"];
        return transitionWords.some(word => content.toLowerCase().includes(word));
    }
}
  
export const imageGenerationSystemInstance = new ImageGenerationSystem();