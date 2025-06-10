from transformers import pipeline
import numpy as np
from typing import List, Dict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DomainClassifier:
    def __init__(self):
        """Initialize the domain classifier with pre-defined research domains"""
        self.classifier = pipeline("zero-shot-classification")
        self.research_domains = [
            "Artificial Intelligence",
            "Machine Learning",
            "Computer Vision",
            "Natural Language Processing",
            "Data Science",
            "Robotics",
            "Internet of Things",
            "Cybersecurity",
            "Cloud Computing",
            "Big Data",
            "Software Engineering",
            "Web Technologies",
            "Network Security",
            "Embedded Systems",
            "VLSI Design",
            "Power Systems",
            "Control Systems",
            "Signal Processing",
            "Communication Systems",
            "Wireless Networks"
        ]

    def classify_text(self, text: str, threshold: float = 0.3) -> List[str]:
        """
        Classify text into research domains using zero-shot classification
        Args:
            text: The text to classify (publication title + abstract)
            threshold: Minimum confidence score to include a domain
        Returns:
            List of predicted research domains
        """
        try:
            result = self.classifier(
                text,
                candidate_labels=self.research_domains,
                multi_label=True
            )
            
            # Get domains above threshold
            domains = [
                label for label, score in zip(result['labels'], result['scores'])
                if score > threshold
            ]
            
            return domains if domains else ["Other"]
            
        except Exception as e:
            logger.error(f"Error in classify_text: {str(e)}")
            return ["Other"]

    def classify_publication(self, publication: Dict) -> Dict:
        """
        Classify a publication into research domains
        Args:
            publication: Dictionary containing publication details
        Returns:
            Publication dict with added research domains
        """
        try:
            # Combine title and abstract for better classification
            text = f"{publication['title']} {publication.get('abstract', '')}"
            
            # Get domain predictions
            domains = self.classify_text(text)
            
            # Add domains to publication dict
            publication['research_domains'] = domains
            
            return publication
            
        except Exception as e:
            logger.error(f"Error in classify_publication: {str(e)}")
            publication['research_domains'] = ["Other"]
            return publication

    def batch_classify_publications(self, publications: List[Dict]) -> List[Dict]:
        """
        Classify multiple publications
        Args:
            publications: List of publication dictionaries
        Returns:
            List of publications with added research domains
        """
        classified_publications = []
        
        for pub in publications:
            try:
                classified_pub = self.classify_publication(pub)
                classified_publications.append(classified_pub)
            except Exception as e:
                logger.error(f"Error classifying publication: {str(e)}")
                pub['research_domains'] = ["Other"]
                classified_publications.append(pub)
                
        return classified_publications 