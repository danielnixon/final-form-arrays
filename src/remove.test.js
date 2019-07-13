import remove from './remove'
import { getIn, setIn } from 'final-form'

describe('remove', () => {
  it('should call changeValue once', () => {
    const changeValue = jest.fn()
    const state = {
      formState: {
        values: {
          foo: ['one', 'two']
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          touched: true,
          error: 'First Error'
        },
        'foo[1]': {
          name: 'foo[1]',
          touched: false,
          error: 'Second Error'
        }
      }
    }
    const result = remove(['foo', 0], state, { changeValue })
    expect(result).toBeUndefined()
    expect(changeValue).toHaveBeenCalled()
    expect(changeValue).toHaveBeenCalledTimes(1)
    expect(changeValue.mock.calls[0][0]).toBe(state)
    expect(changeValue.mock.calls[0][1]).toBe('foo')
    expect(typeof changeValue.mock.calls[0][2]).toBe('function')
  })

  it('should treat undefined like an empty array', () => {
    const changeValue = jest.fn()
    const state = {
      formState: {
        values: {
          foo: undefined
        }
      },
      fields: {}
    }
    const returnValue = remove(['foo', 1], state, { changeValue })
    expect(returnValue).toBeUndefined()
    const op = changeValue.mock.calls[0][2]
    const result = op(undefined)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(0)
  })

  it('should remove value from the specified index, and return it', () => {
    const array = ['a', 'b', 'c', 'd']
    // implementation of changeValue taken directly from Final Form
    const changeValue = (state, name, mutate) => {
      const before = getIn(state.formState.values, name)
      const after = mutate(before)
      state.formState.values = setIn(state.formState.values, name, after) || {}
    }
    const state = {
      formState: {
        values: {
          foo: array,
          anotherField: 42
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          touched: true,
          error: 'A Error'
        },
        'foo[1]': {
          name: 'foo[1]',
          touched: false,
          error: 'B Error'
        },
        'foo[2]': {
          name: 'foo[2]',
          touched: true,
          error: 'C Error'
        },
        'foo[3]': {
          name: 'foo[3]',
          touched: false,
          error: 'D Error'
        },
        anotherField: {
          name: 'anotherField',
          touched: false
        }
      }
    }
    const returnValue = remove(['foo', 1], state, { changeValue })
    expect(returnValue).toBe('b')
    expect(state.formState.values.foo).not.toBe(array) // copied
    expect(state).toEqual({
      formState: {
        values: {
          foo: ['a', 'c', 'd'],
          anotherField: 42
        }
      },
      fields: {
        'foo[0]': {
          name: 'foo[0]',
          touched: true,
          error: 'A Error'
        },
        'foo[1]': {
          name: 'foo[1]',
          touched: true,
          error: 'C Error',
          forceUpdate: true
        },
        'foo[2]': {
          name: 'foo[2]',
          touched: false,
          error: 'D Error',
          forceUpdate: true
        },
        anotherField: {
          name: 'anotherField',
          touched: false
        }
      }
    })
  })
})
