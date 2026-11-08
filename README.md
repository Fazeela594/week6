# Freelancing Marketplace Platform: Week 5

**Orders, Contracts & Project Management**

Author: Fazeela Manzoor

## Overview

Week 5 adds the next step of the marketplace workflow: when a client accepts a proposal, the project becomes an active order. Clients and freelancers can then manage the project through milestones, delivery and approval.

```
Proposal → Accepted → Order / Contract → Project Progress → Completed
```

Everything is built with plain HTML5, CSS3 and JavaScript, with no frameworks or backend.

## Project Structure

```
week5/
├── index.html   # page structure (header, role switch, main container)
├── style.css    # all styling and responsive layout
├── script.js    # orders, milestones, delivery, statuses, validation
└── README.md
```

## How to Run

1. Keep all files in the same folder.
2. Open `index.html` in any modern browser.

No installation or server is needed. The page uses hash routing (`#/orders`, `#/order/<id>`, `#/proposals`), so it works when opened directly from the file system.

## Features

### Pages

| Page | Route | Description |
|---|---|---|
| My Orders | `#/orders` | Active, completed and cancelled projects with progress and deadlines |
| Project Details | `#/order/<id>` | Status, progress, milestones, delivery, activity and people |
| Proposals | `#/proposals` | Pending proposals. Accepting one creates a new order |

### Client view and Freelancer view

Use the switch in the header to change between the two views. The same project shows different actions for each role.

| Action | Client | Freelancer |
|---|---|---|
| Accept or decline a proposal | Yes | No |
| Start the project | No | Yes |
| Submit a milestone for review | No | Yes |
| Approve a milestone and release payment | Yes | No |
| Request changes on a milestone | Yes | No |
| Add or remove milestones | Yes | No |
| Submit the final delivery | No | Yes |
| Approve and complete, or request a revision | Yes | No |
| Cancel the project | Yes | Yes |

### Order statuses

Pending, In Progress, Submitted, Completed and Cancelled. A status tracker on the details page shows where the project is.

### Project management

- **Progress indicator:** a percentage and bar based on the value of approved milestones
- **Milestone tracking:** each milestone has an amount, due date and status (To do, In review, Approved). Overdue milestones are marked
- **Budget control:** new milestones cannot go over the project budget
- **Payments:** shows how much of the budget has been released
- **Deadline:** days left or days overdue
- **Delivery section:** the freelancer sends a message and an optional link. The client approves it or asks for a revision
- **Activity timeline:** every action is logged with the time

### Forms and validation

- **Add milestone:** title (min. 3 characters), whole-number amount within the remaining budget, due date not after the project deadline
- **Delivery:** message (min. 20 characters) and an optional link that must start with http or https
- **Revision request:** note (min. 10 characters)
- Inline error messages under each field

### Interactive states

- Loading skeleton when the page opens
- Empty states (no projects in a tab, no proposals)
- "Project not found" state
- Confirmation dialogs for completing, cancelling and resetting
- Delivery is blocked until all milestones are submitted
- Toast messages after every action

### Responsive design

The layout adapts to desktop, tablet and mobile screens.

## Data Storage

Orders and proposals are saved in the browser's `localStorage`, so they stay after a page refresh. To go back to the sample data, click **Reset demo data** in the footer, or run this in the browser console and reload:

```js
localStorage.removeItem("hunar_week5")
```

## Testing the Workflow

1. Open **Proposals** in Client view and click **Accept proposal**. A new Pending order is created.
2. Switch to **Freelancer view** and click **Start project**.
3. Submit each milestone for review.
4. Send the final delivery with a message.
5. Switch to **Client view**, approve the milestones, then click **Approve and complete**.

## Technologies

- HTML5
- CSS3 (Grid, Flexbox, media queries)
- JavaScript (ES6)
