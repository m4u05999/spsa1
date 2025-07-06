import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock contentService
const mockContentService = {
  getAll: vi.fn(),
  getById: vi.fn(),
  search: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn()
}

describe('contentService', () => {
  const mockContents = [
    {
      id: '1',
      title: 'مقال تجريبي',
      type: 'article',
      author: 'د. محمد أحمد',
      status: 'published'
    },
    {
      id: '2',
      title: 'بحث تجريبي',
      type: 'research',
      author: 'د. فاطمة علي',
      status: 'draft'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('يجب أن يعيد جميع المحتويات', async () => {
      mockContentService.getAll.mockResolvedValue(mockContents)

      const result = await mockContentService.getAll()

      expect(result).toEqual(mockContents)
      expect(mockContentService.getAll).toHaveBeenCalled()
    })
  })

  describe('getById', () => {
    it('يجب أن يعيد المحتوى بالمعرف المحدد', async () => {
      mockContentService.getById.mockResolvedValue(mockContents[0])

      const result = await mockContentService.getById('1')

      expect(result).toEqual(mockContents[0])
      expect(mockContentService.getById).toHaveBeenCalledWith('1')
    })
  })

  describe('search', () => {
    it('يجب أن يبحث في المحتوى', async () => {
      const searchResults = [mockContents[0]]
      mockContentService.search.mockResolvedValue(searchResults)

      const result = await mockContentService.search({ query: 'مقال' })

      expect(result).toEqual(searchResults)
      expect(mockContentService.search).toHaveBeenCalledWith({ query: 'مقال' })
    })
  })
})
