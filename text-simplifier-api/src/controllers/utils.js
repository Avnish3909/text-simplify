const createPrompt = (text, level = 'standard') => {
    const prompts = {
      elementary: 'Simplify this text for elementary school students, using basic vocabulary and short sentences.',
      standard: 'Simplify this text for general audience, maintaining clarity while removing complexity.',
      technical: 'Maintain technical accuracy while improving clarity and readability.'
    };
  
    return `
  Text to simplify: "${text}"
  
  Instructions:
  1. ${prompts[level]}
  2. Provide 3-5 key points
  3. Assess reading level
  
  Format the response exactly as:
  SIMPLIFIED: [simplified text]
  KEY_POINTS:
  - [point 1]
  - [point 2]
  - [point 3]
  LEVEL: [reading level]
  `;
  };
  
  const parseResponse = (response) => {
    try {
      const simplifiedMatch = response.match(/SIMPLIFIED: (.*?)(?=\nKEY_POINTS:)/s);
      const keyPointsMatch = response.match(/KEY_POINTS:\n((?:- .*\n?)*)/s);
      const levelMatch = response.match(/LEVEL: (.*?)$/s);
  
      const simplified = simplifiedMatch?.[1]?.trim() || '';
      const keyPoints = keyPointsMatch?.[1]
        ?.split('\n')
        .filter(point => point.startsWith('- '))
        .map(point => point.slice(2).trim()) || [];
      const level = levelMatch?.[1]?.trim() || '';
  
      return {
        simplified,
        keyPoints,
        level,
        error: null
      };
    } catch (error) {
      return {
        simplified: '',
        keyPoints: [],
        level: '',
        error: 'Failed to parse AI response'
      };
    }
  };
  
  module.exports = {
    createPrompt,
    parseResponse
  };