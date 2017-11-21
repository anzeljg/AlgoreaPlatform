ALTER TABLE `groups`
CHANGE `sDateCreated` `sDateCreated` datetime NULL AFTER `sDescription`;

ALTER TABLE `history_groups`
CHANGE `sDateCreated` `sDateCreated` datetime NULL AFTER `sDescription`;

ALTER TABLE `groups_items`
CHANGE `sCachedAccessReason` `sCachedAccessReason` varchar(200) NULL AFTER `sCachedGrayedAccessDate`;

ALTER TABLE `history_groups_items`
CHANGE `sCachedAccessReason` `sCachedAccessReason` varchar(200) NULL AFTER `sCachedGrayedAccessDate`;

ALTER TABLE `groups`
CHANGE `sRedirectPath` `sRedirectPath` text COLLATE 'utf8_general_ci' NULL AFTER `sPasswordEnd`;

ALTER TABLE `history_groups`
CHANGE `sRedirectPath` `sRedirectPath` text COLLATE 'utf8_general_ci' NULL AFTER `sPasswordEnd`;