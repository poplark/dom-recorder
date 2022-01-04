import { generateId } from './utils/id';

enum NodeType {
  Document,
  DocumentType,
  Element,
  Text,
  CDATA,
  Comment,
}

interface DocumentNode {
  type: NodeType.Document;
  childNodes: SerializedNode[];
}

interface DocumentTypeNode {
  type: NodeType.DocumentType;
  name: string;
  publicId: string;
  systemId: string;
}

interface ElementNode {
  type: NodeType.Element;
  tagName: string;
  Attributes: Attributes;
  childNodes: SerializedNode[];
}

type SerializedNode = DocumentNode | DocumentTypeNode | ElementNode | TextNode | CdataNode | CommentNode;

type Attributes = Record<string, string>;

interface TextNode {
  type: NodeType.Text;
  textContent: string;
}

interface CdataNode {
  type: NodeType.CDATA;
  textContent: '';
}

interface CommentNode {
  type: NodeType.Comment;
  textContent: string | null;
}

function serializeNode(n: Node): SerializedNode | false {
  switch (n.nodeType) {
    case n.DOCUMENT_NODE:
      return {
        type: NodeType.Document,
        childNodes: [],
      };
    case n.DOCUMENT_TYPE_NODE:
      return {
        type: NodeType.DocumentType,
        name: (n as DocumentType).name,
        publicId: (n as DocumentType).publicId,
        systemId: (n as DocumentType).systemId,
      };
    case n.ELEMENT_NODE:
      const tagName = (n as HTMLElement).tagName.toLowerCase();
      const Attributes: Attributes = {};
      for (const { name, value } of Array.from((n as HTMLElement).attributes)) {
        Attributes[name] = value;
      }
      return {
        type: NodeType.Element,
        tagName,
        Attributes,
        childNodes: [],
      };
    case n.TEXT_NODE:
      // The parent node may not be a html element which has a tagName attribute.
      // So just let it be undefined which is ok in this use case.
      const parentTagName = n.parentNode && (n.parentNode as HTMLElement).tagName;
      let textContent = (n as Text).textContent;
      if (parentTagName === 'SCRIPT') {
        textContent = '';
      }
      return {
        type: NodeType.Text,
        textContent,
      } as TextNode;
    case n.CDATA_SECTION_NODE:
      return {
        type: NodeType.CDATA,
        textContent: '',
      };
    case n.COMMENT_NODE:
      return {
        type: NodeType.Comment,
        textContent: (n as Comment).textContent,
      };
    default:
      return false;
  }
}

type SerializedNodeWithId = SerializedNode & { id: number };

export function snapshot(n: Node): SerializedNodeWithId | null {
  const _SerializedNode = serializeNode(n);
  if (!_SerializedNode) {
    // TODO: dev only
    console.warn(n, 'not serialized');
    return null;
  }
  const SerializedNode: SerializedNodeWithId = Object.assign(_SerializedNode, {
    id: generateId(),
  });
  if (SerializedNode.type === NodeType.Document || SerializedNode.type === NodeType.Element) {
    for (const childN of Array.from(n.childNodes)) {
      const snapshotChildN = snapshot(childN);
      snapshotChildN && SerializedNode.childNodes.push(snapshotChildN);
    }
  }
  return SerializedNode;
}
