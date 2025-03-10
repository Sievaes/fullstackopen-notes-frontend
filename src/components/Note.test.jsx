import { render, screen } from "@testing-library/react"

import userEvent from "@testing-library/user-event"
import Note from "./Note"

// ...

test("clicking the button calls event handler once", async () => {
  const note = {
    content: "Component testing is done with react-testing-library",
    important: true,
  }

  const mockHandler = vi.fn()

  render(<Note note={note} toggleImportance={mockHandler} />)

  const user = userEvent.setup()
  const button = screen.getByText("make not important")
  await user.click(button)

  expect(mockHandler.mock.calls).toHaveLength(1)
})

// test("renders content", () => {
//   const note = {
//     content: "Component testing is done with react-testing-library",
//     important: true,
//   }

//   render(<Note note={note} />)

//   const element = screen.getByText(
//     "Component testing is done with react-testing-library"
//   )

//   //to print the html of a component to terminal
//   // screen.debug(element)

//   //check if the defined element is found
//   expect(element).toBeDefined()
// })
