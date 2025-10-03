from __future__ import annotations

from textwrap import dedent

from api.services.document_processor import DocumentProcessor


def build_processor() -> DocumentProcessor:
    return DocumentProcessor(model_name="sentence-transformers/all-MiniLM-L6-v2", batch_size=4)


def test_resume_chunking_preserves_sections():
    processor = build_processor()
    resume_text = dedent(
        """
        SUMMARY
        Experienced Python developer.

        EXPERIENCE
        Worked at Company A.

        SKILLS
        Python, SQL
        """
    ).strip()
    chunks = processor.dynamic_chunking(resume_text, "txt")
    assert len(chunks) == 3
    assert chunks[0].startswith("SUMMARY")


def test_contract_chunking_uses_clauses():
    processor = build_processor()
    contract_text = dedent(
        """
        Agreement between parties.

        Clause 1: Payment terms.

        Clause 2: Confidentiality.
        """
    ).strip()
    chunks = processor.dynamic_chunking(contract_text, "txt")
    assert any("Clause 1" in chunk for chunk in chunks)
    assert any("Clause 2" in chunk for chunk in chunks)
