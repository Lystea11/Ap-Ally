import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:flutter_math_fork/flutter_math.dart';
import '../models/lesson_content_models.dart';

class ContentBlockRenderer extends StatelessWidget {
  final ContentBlock contentBlock;

  const ContentBlockRenderer({
    super.key,
    required this.contentBlock,
  });

  @override
  Widget build(BuildContext context) {
    switch (contentBlock.type) {
      case ContentBlockType.markdown:
        return _buildMarkdownBlock(contentBlock as MarkdownContentBlock);
      case ContentBlockType.table:
        return _buildTableBlock(contentBlock as TableContentBlock);
      case ContentBlockType.diagram:
        return _buildDiagramBlock(contentBlock as DiagramContentBlock);
    }
  }

  Widget _buildMarkdownBlock(MarkdownContentBlock block) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: MarkdownBody(
          data: block.content,
          selectable: true,
          styleSheet: _getMarkdownStyleSheet(),
        ),
      ),
    );
  }

  Widget _buildTableBlock(TableContentBlock block) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            headingRowColor: WidgetStateProperty.all(Colors.grey[100]),
            columns: block.headers.map((header) {
              return DataColumn(
                label: Expanded(
                  child: _renderMathText(header),
                ),
              );
            }).toList(),
            rows: block.rows.map((row) {
              return DataRow(
                cells: row.map((cell) {
                  return DataCell(_renderMathText(cell));
                }).toList(),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  Widget _buildDiagramBlock(DiagramContentBlock block) {
    // For now, we'll show a placeholder for diagrams
    // In a production app, you'd want to integrate a mermaid renderer
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.blue[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.account_tree,
                color: Colors.blue[700],
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Diagram (${block.diagramType})',
                style: TextStyle(
                  color: Colors.blue[700],
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: Colors.grey[300]!),
            ),
            child: Text(
              block.code,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Note: Diagram rendering will be implemented in a future version.',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }

  Widget _renderMathText(String text) {
    final mathRegex = RegExp(r'\$([^$]+)\$');
    final matches = mathRegex.allMatches(text);
    
    if (matches.isEmpty) {
      return Text(text);
    }

    List<InlineSpan> spans = [];
    int lastEnd = 0;

    for (final match in matches) {
      // Add text before the math
      if (match.start > lastEnd) {
        spans.add(TextSpan(
          text: text.substring(lastEnd, match.start),
        ));
      }

      // Add the math
      final mathContent = match.group(1)!;
      spans.add(WidgetSpan(
        child: Math.tex(
          mathContent,
          mathStyle: MathStyle.text,
          textStyle: const TextStyle(fontSize: 14),
        ),
      ));

      lastEnd = match.end;
    }

    // Add remaining text
    if (lastEnd < text.length) {
      spans.add(TextSpan(
        text: text.substring(lastEnd),
      ));
    }

    return RichText(
      text: TextSpan(
        children: spans,
        style: const TextStyle(fontSize: 14),
      ),
    );
  }

  MarkdownStyleSheet _getMarkdownStyleSheet() {
    return MarkdownStyleSheet(
      h1: const TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        color: Colors.black87,
      ),
      h2: const TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: Colors.black87,
      ),
      h3: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: Colors.black87,
      ),
      h4: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: Colors.black87,
      ),
      p: const TextStyle(
        fontSize: 14,
        color: Colors.black87,
        height: 1.5,
      ),
      listBullet: const TextStyle(
        fontSize: 14,
        color: Colors.black87,
      ),
      strong: const TextStyle(
        fontWeight: FontWeight.bold,
      ),
      em: const TextStyle(
        fontStyle: FontStyle.italic,
      ),
      code: TextStyle(
        fontFamily: 'monospace',
        backgroundColor: Colors.grey[200],
        fontSize: 13,
      ),
      codeblockPadding: const EdgeInsets.all(12),
      codeblockDecoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.grey[300]!),
      ),
      blockquote: const TextStyle(
        fontStyle: FontStyle.italic,
        color: Colors.black54,
      ),
      blockquoteDecoration: BoxDecoration(
        color: Colors.grey[50],
        border: Border(
          left: BorderSide(
            color: Colors.grey[400]!,
            width: 4,
          ),
        ),
      ),
      blockquotePadding: const EdgeInsets.all(12),
    );
  }
}