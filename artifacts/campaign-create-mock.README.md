# Campaign creation mock

This mock explores the `/campaign/add` campaign creation route before implementation.

The form is grounded in the backend `CreateCampaignInput`: campaign name, tenant phone, contact groups,
message template, and optional image media. The visible SMS/MMS state is derived from whether media is attached.

Contact fields are rendered as human-readable inline chips; raw template syntax remains an implementation detail.
Contact groups are rendered as compact, removable rows with the group name on the left and contact count on the right.
Add selects the first group that is not already present and becomes disabled when every available group has been added.

The two PNG files show the preview expanded with groups still available and collapsed with every group selected.

`campaign-create-compact-images.png` replaces the image drop zone with an Image toolbar action and compact attachment
cards. `campaign-create-image-lightbox.png` shows the fullscreen viewer opened by selecting a card; it closes through
the close button, backdrop, or Escape key.
