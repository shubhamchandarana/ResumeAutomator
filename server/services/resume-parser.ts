import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';

export async function parseResumeFile(filePath: string, mimeType: string): Promise<string> {
  try {
    console.log(`Parsing resume file: ${filePath} (${mimeType})`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error("Resume file not found");
    }

    let extractedText = '';
    
    if (mimeType === 'application/pdf') {
      // For now, return a placeholder for PDF parsing
      // TODO: Integrate a working PDF parsing library
      extractedText = "PDF Resume Content - Please note: PDF parsing is currently being improved. For best results, please upload Word documents (.docx) or contact support.";
      console.log('PDF file detected - using placeholder content');
      
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
               mimeType === 'application/msword') {
      // Parse DOCX/DOC files
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
      console.log(`Extracted ${extractedText.length} characters from Word document`);
      
      if (result.messages && result.messages.length > 0) {
        console.log('Document parsing messages:', result.messages);
      }
      
    } else if (mimeType === 'text/plain') {
      // Parse plain text files
      extractedText = fs.readFileSync(filePath, 'utf8');
      console.log(`Extracted ${extractedText.length} characters from text file`);
      
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    // Clean and validate extracted text
    extractedText = extractedText.trim();
    
    if (!extractedText || extractedText.length < 20) {
      throw new Error("Resume unreadable - no meaningful content could be extracted");
    }

    // Basic text cleaning
    extractedText = extractedText
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/\n\s*\n/g, '\n')  // Remove extra newlines
      .trim();

    console.log(`Final cleaned text length: ${extractedText.length} characters`);
    return extractedText;

  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to parse resume file');
  }
}

export function validateResumeContent(text: string): boolean {
  // Check if the text contains resume-like content
  const resumeKeywords = [
    'experience', 'education', 'skills', 'work', 'employment', 
    'university', 'college', 'degree', 'certificate', 'project',
    'manager', 'developer', 'engineer', 'analyst', 'specialist',
    'phone', 'email', 'address', 'linkedin', 'github'
  ];

  const lowerText = text.toLowerCase();
  const foundKeywords = resumeKeywords.filter(keyword => 
    lowerText.includes(keyword)
  );

  // Require at least 3 resume-related keywords
  return foundKeywords.length >= 3 && text.length >= 50;
}