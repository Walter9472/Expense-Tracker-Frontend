import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import Header from '../layout/Header.vue'

describe('Header', () => {
  it('renders navigation links', () => {
    const wrapper = mount(Header)
    const links = wrapper.findAll('a').map((link) => link.text())

    expect(links).toContain('Transaktionen')
    expect(links).toContain('Neue Transaktion')
  })
})
