import { visit } from 'unist-util-visit'

/**
 * Safely create a <figure> element from an image node.
 * This function is defensive about node shapes (rehype or mdast) and property types.
 */
function createFigure(imgNode, isInGallery = false) {
  // Normalize alt text to a string
  const rawAlt = imgNode?.properties?.alt ?? imgNode?.alt ?? ''
  const altText = typeof rawAlt === 'string' ? rawAlt : String(rawAlt ?? '')
  const shouldSkipCaption = !altText || (typeof altText === 'string' && altText.startsWith('_'))
  if (shouldSkipCaption && !isInGallery) {
    return imgNode
  }

  const children = [imgNode]

  if (!shouldSkipCaption) {
    children.push({
      type: 'element',
      tagName: 'figcaption',
      properties: {},
      children: [{ type: 'text', value: altText }],
    })
  }

  return {
    type: 'element',
    tagName: 'figure',
    properties: isInGallery ? { className: ['gallery-item'] } : {},
    children,
  }
}

export function rehypeImageProcessor() {
  return (tree) => {
    // Wrap visitor logic in try/catch to avoid breaking the whole transform on unexpected nodes
    visit(tree, 'element', (node, index, parent) => {
      try {
        // Skip non-paragraph elements, empty paragraphs, and orphaned nodes
        if (node.tagName !== 'p' || !node.children?.length || !parent) {
          return
        }

        // Collect images from paragraph (be defensive: support rehype <img>, mdast image nodes,
        // and elements that expose src/url via properties)
        const imgNodes = []
        for (const child of node.children) {
          // Standard rehype element
          if (child?.type === 'element' && (child.tagName === 'img' || child.tagName === 'image')) {
            imgNodes.push(child)
            continue
          }

          // mdast image node (in some trees it may appear before rehype conversion)
          if (child?.type === 'image') {
            // normalize to rehype-like element for downstream processing
            const normalized = {
              type: 'element',
              tagName: 'img',
              properties: {
                src: child.url,
                alt: child.alt ?? '',
                title: child.title ?? '',
              },
            }
            imgNodes.push(normalized)
            continue
          }

          // Some editors/transformers put image-like objects with properties.src or properties.url
          if (child?.type === 'element' && child.properties && (child.properties.src || child.properties.url)) {
            // ensure properties.src exists
            if (!child.properties.src && child.properties.url) {
              child.properties.src = child.properties.url
            }
            imgNodes.push(child)
            continue
          }

          // If there's any other non-empty text or node, skip processing this paragraph
          if (child.type !== 'text' || String(child.value ?? '').trim() !== '') {
            return // Skip paragraphs with non-image content
          }
        }

        if (imgNodes.length === 0) {
          return
        }

        // Normalize parent className to array if it's a string
        const parentClass = parent?.properties?.className
        const classList = Array.isArray(parentClass)
          ? parentClass
          : typeof parentClass === 'string'
          ? [parentClass]
          : []

        const isInGallery = classList.includes('gallery-container')

        // Gallery container: convert images to figures
        if (isInGallery) {
          const figures = imgNodes.map((imgNode) => {
            try {
              return createFigure(imgNode, true)
            } catch (e) {
              // If one image fails, keep the original node to avoid losing content
              // eslint-disable-next-line no-console
              console.warn('createFigure failed for gallery image', e)
              return imgNode
            }
          })
          parent.children.splice(index, 1, ...figures)
          return
        }

        // Single image: convert to figure in non-gallery containers
        if (imgNodes.length === 1) {
          let figure
          try {
            figure = createFigure(imgNodes[0], false)
          } catch (e) {
            // If createFigure fails, don't replace the node
            // eslint-disable-next-line no-console
            console.warn('createFigure failed for single image', e)
            return
          }

          if (figure !== imgNodes[0]) {
            // Only replace if conversion happened
            node.tagName = 'figure'
            node.properties = figure.properties
            node.children = figure.children
          }
          return
        }

        // Multiple images: unwrap in non-gallery containers (leave images as-is)
        parent.children.splice(index, 1, ...imgNodes)
      } catch (err) {
        // Do not throw — log and continue processing other nodes
        // eslint-disable-next-line no-console
        console.warn('rehype-image-processor encountered an error while processing a node:', err)
        return
      }
    })
  }
}
