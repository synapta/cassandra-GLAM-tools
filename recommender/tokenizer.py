import re
import unidecode

pattern_lines = re.compile('([^ \w]|_)+', re.MULTILINE)
pattern_alpha = re.compile('[^a-zA-Z]', re.UNICODE)

def tokenize(doc):
    tokens = []
    doc = unidecode.unidecode(doc)
    doc = pattern_lines.sub(' ', doc)
    doc = pattern_alpha.sub(' ', doc)
    
    for word in doc.split():
        word = word.lower()
        if len(word) >= 4:
            tokens.append(word)
    
    return tokens