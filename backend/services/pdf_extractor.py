"""
PDF Text Extraction Service using PyMuPDF
"""
import logging
import time
from typing import Tuple, Optional
import io

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False
    logging.warning("PyMuPDF not available. PDF extraction will not work.")

logger = logging.getLogger(__name__)

class PDFExtractor:
    """Extract text from PDF files using PyMuPDF"""
    
    @staticmethod
    def extract_text(pdf_content: bytes) -> Tuple[str, int, int]:
        """
        Extract text from PDF content
        
        Args:
            pdf_content: PDF file content as bytes
            
        Returns:
            Tuple of (extracted_text, character_count, page_count)
            Returns empty string if extraction fails or PDF is scanned
        """
        if not PYMUPDF_AVAILABLE:
            logger.error("PyMuPDF not available. Cannot extract text.")
            return "", 0, 0
        
        start_time = time.time()
        
        try:
            # Open PDF from bytes
            pdf_document = fitz.open(stream=pdf_content, filetype="pdf")
            page_count = len(pdf_document)
            
            # Extract text from all pages
            extracted_text = ""
            for page_num in range(page_count):
                page = pdf_document[page_num]
                page_text = page.get_text()
                extracted_text += page_text + "\n"
            
            # Clean up
            pdf_document.close()
            
            # Count characters (excluding whitespace)
            char_count = len(extracted_text.strip())
            
            extraction_time = time.time() - start_time
            logger.info(f"PDF extraction completed: {page_count} pages, {char_count} characters in {extraction_time:.2f}s")
            
            # If extracted text is empty or very short, likely a scanned PDF
            if char_count < 50:
                logger.warning("Extracted text is very short. PDF may be scanned/image-based.")
                return "", 0, page_count
            
            return extracted_text.strip(), char_count, page_count
            
        except Exception as e:
            extraction_time = time.time() - start_time
            logger.error(f"PDF extraction failed after {extraction_time:.2f}s: {str(e)}")
            return "", 0, 0
    
    @staticmethod
    def validate_pdf(pdf_content: bytes) -> bool:
        """
        Validate that the content is a valid PDF
        
        Args:
            pdf_content: PDF file content as bytes
            
        Returns:
            True if valid PDF, False otherwise
        """
        if not PYMUPDF_AVAILABLE:
            return False
        
        try:
            # Check PDF header
            if not pdf_content.startswith(b"%PDF-"):
                return False
            
            # Try to open the PDF
            pdf_document = fitz.open(stream=pdf_content, filetype="pdf")
            pdf_document.close()
            return True
        except Exception:
            return False

# Global instance
pdf_extractor = PDFExtractor()


