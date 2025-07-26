// Content models for dynamic lesson generation
// These mirror the web app's content block structure

enum ContentBlockType {
  markdown,
  table,
  diagram,
}

abstract class ContentBlock {
  final ContentBlockType type;
  
  const ContentBlock({required this.type});
  
  Map<String, dynamic> toJson();
  
  factory ContentBlock.fromJson(Map<String, dynamic> json) {
    final typeStr = json['type'] as String;
    final type = ContentBlockType.values.firstWhere(
      (e) => e.name == typeStr,
      orElse: () => ContentBlockType.markdown,
    );
    
    switch (type) {
      case ContentBlockType.markdown:
        return MarkdownContentBlock.fromJson(json);
      case ContentBlockType.table:
        return TableContentBlock.fromJson(json);
      case ContentBlockType.diagram:
        return DiagramContentBlock.fromJson(json);
    }
  }
}

class MarkdownContentBlock extends ContentBlock {
  final String content;
  
  const MarkdownContentBlock({
    required this.content,
  }) : super(type: ContentBlockType.markdown);
  
  factory MarkdownContentBlock.fromJson(Map<String, dynamic> json) {
    return MarkdownContentBlock(
      content: json['content'] as String,
    );
  }
  
  @override
  Map<String, dynamic> toJson() {
    return {
      'type': type.name,
      'content': content,
    };
  }
}

class TableContentBlock extends ContentBlock {
  final List<String> headers;
  final List<List<String>> rows;
  
  const TableContentBlock({
    required this.headers,
    required this.rows,
  }) : super(type: ContentBlockType.table);
  
  factory TableContentBlock.fromJson(Map<String, dynamic> json) {
    return TableContentBlock(
      headers: List<String>.from(json['headers'] as List),
      rows: (json['rows'] as List)
          .map((row) => List<String>.from(row as List))
          .toList(),
    );
  }
  
  @override
  Map<String, dynamic> toJson() {
    return {
      'type': type.name,
      'headers': headers,
      'rows': rows,
    };
  }
}

class DiagramContentBlock extends ContentBlock {
  final String diagramType;
  final String code;
  
  const DiagramContentBlock({
    required this.diagramType,
    required this.code,
  }) : super(type: ContentBlockType.diagram);
  
  factory DiagramContentBlock.fromJson(Map<String, dynamic> json) {
    return DiagramContentBlock(
      diagramType: json['diagramType'] as String,
      code: json['code'] as String,
    );
  }
  
  @override
  Map<String, dynamic> toJson() {
    return {
      'type': type.name,
      'diagramType': diagramType,
      'code': code,
    };
  }
}

class PracticeQuestion {
  final String question;
  final List<String> options;
  final int correctAnswerIndex;
  final String explanation;
  final String hint;
  
  const PracticeQuestion({
    required this.question,
    required this.options,
    required this.correctAnswerIndex,
    required this.explanation,
    required this.hint,
  });
  
  factory PracticeQuestion.fromJson(Map<String, dynamic> json) {
    return PracticeQuestion(
      question: json['question'] as String,
      options: List<String>.from(json['options'] as List),
      correctAnswerIndex: json['correctAnswerIndex'] as int,
      explanation: json['explanation'] as String,
      hint: json['hint'] as String,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'question': question,
      'options': options,
      'correctAnswerIndex': correctAnswerIndex,
      'explanation': explanation,
      'hint': hint,
    };
  }
}

class Flashcard {
  final String question;
  final String answer;
  
  const Flashcard({
    required this.question,
    required this.answer,
  });
  
  factory Flashcard.fromJson(Map<String, dynamic> json) {
    return Flashcard(
      question: json['question'] as String,
      answer: json['answer'] as String,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'question': question,
      'answer': answer,
    };
  }
}

class LessonContent {
  final List<ContentBlock> content;
  final List<PracticeQuestion> practiceQuestions;
  final List<Flashcard>? flashcards;
  
  const LessonContent({
    required this.content,
    required this.practiceQuestions,
    this.flashcards,
  });
  
  factory LessonContent.fromJson(Map<String, dynamic> json) {
    return LessonContent(
      content: (json['content'] as List)
          .map((item) => ContentBlock.fromJson(item as Map<String, dynamic>))
          .toList(),
      practiceQuestions: (json['practiceQuestions'] as List)
          .map((item) => PracticeQuestion.fromJson(item as Map<String, dynamic>))
          .toList(),
      flashcards: json['flashcards'] != null
          ? (json['flashcards'] as List)
              .map((item) => Flashcard.fromJson(item as Map<String, dynamic>))
              .toList()
          : null,
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'content': content.map((block) => block.toJson()).toList(),
      'practiceQuestions': practiceQuestions.map((q) => q.toJson()).toList(),
      if (flashcards != null)
        'flashcards': flashcards!.map((f) => f.toJson()).toList(),
    };
  }
}