# Convert standard zone identifiers to editor-specific identifiers
# See: http://github.com/elliottcable/espresso-sugar-standard


textmate = 
    "literal.string": "string"
    "literal.numeric": "constant.numeric"
    "literal.keyword": "constant.language"    
    "literal.escape.string": "constant.character.escape, string source"
    
    "identifier.function": "entity.name.function, support.function.any-method"
    "identifier.type": "entity.name.type"
    "identifier.variable.constant": "constant"
    "identifier.variable.instance": "variable.language, variable.other"
    "identifier.variable.parameter": "variable.parameter"
    
    "keyword.control": "keyword"
    "keyword.storage": "storage"
    
    "metadata.comment": "comment"
    "metadata.processing.directive": "keyword.control.import"
    "metadata.processing.line": "meta.preprocessor"
    "metadata.embedded": "text source, string.unquoted"
    
    "operator": "keyword.operator"
    
    "tag": "meta.tag, declaration.tag"
    "tag.delimiter": "entity.name.tag"
    "tag.attribute": "entity.other.attribute-name"
    

# http://vimdoc.sourceforge.net/htmldoc/syntax.html#group-name
vim =
    "literal.string": "String"
    "literal.character": "Character"
    "literal.numeric": "Number"
    "literal.numeric.float": "Float"
    "literal.keyword": "Boolean"
    "literal.escape.string": "SpecialChar"
    
    "identifier": "Identifier"
    "identifier.function": "Function"
    "identifier.type": "Type"
    "identifier.variable.constant": "Constant"
    
    "keyword.control": "Statement"
    "keyword.storage": "StorageClass"
    
    "metadata.comment": "Comment"
    "metadata.processing.directive": "PreProc"
        
    "operator": "Operator"
    
    "tag": "Tag"
