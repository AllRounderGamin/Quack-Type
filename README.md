# Quack-Type
Web extension that adds the support of several friends for every key you press

### Currently, only works for Firefox - This project was made for fun, and I make no promises to update

## Commands

#### To Activate Quack-Type
To active quacks on your current tab simply press Ctrl+q from this point on quacks will play on key presses related to your settings

#### To Deactivate Quack-Type
To deactivate quacks on your current tab simply press Alt+q, this will remove the event listener for quacks

Please note quacks will not be re-added by pressing Ctrl+q without first refreshing the page

#### Addendum
For both commands they will only apply to the tab you are on when you trigger them, you must use the command for each tab you wish to toggle quacking on

## Automatic Quacking
The "Toggle Permissions" menu in the extension popup will allow you to grant host permissions to the extension, if done
Quack-Type will be activated automatically on every new tab, or on current tabs when they are next updated, this
permission can be revoked by hitting the same button any time.

## Quack Options

On install volume is set to 50%, Letters, Numbers and Punctuation are active, other options are not.

- Letters: Refers to any letter of the alphabet, capitalised and non capitalised
- Numbers: The top row of numbers on the keyboard
- Punctuation: Any other key such as actual punctuation or keys like Ctrl or Alt
- Mouse: Left clicks will trigger duck quacks to!

## Special Options

On install Random Quacks are disabled and no urls are filtered.

- Random Quacks: Currently quack played is based on ASCII of used key, this option will mean every key press plays a
  random quack!

#### Url Filtering

Can either type url to block into the text box and click add or use one of the "add current" buttons.

Clicking a url will highlight it, holding ctrl and clicking another will allow the selection of multiple urls and clicking 
another url without holding control, or re-clicking the same url will remove the highlight. The delete button will delete 
all currently highlighted url.

- Blocking on a page will only block that exact url.
- Blocking on a site should block all urls from the given site.


## Note
Sometimes the ogg file will not be recognised, this will result in the sound not playing and an error message in the
console but the extension will continue working. This seems to be a Firefox issue and only tends to happen for the first
few seconds of a webpage being loaded.
