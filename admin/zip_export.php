<?php

require_once "../shared/connect.php";

error_reporting(E_ALL);
ini_set('display_errors', 1);

$main_group_id = $_GET['groupId'];
$main_item_id = $_GET['itemId'];

function make_and_change_directory($name) {
   $name = preg_replace("/[^a-zA-Z0-9_\-]/", "_" , $name);
   if($name == "") {
      $name = "_";
   }
   mkdir($name);
   chdir($name);
   
   return $name;
}


function return_from_directory() {
   chdir("..");
}


function mktempdir($prefix='') { // modified, from http://stackoverflow.com/questions/1707801/making-a-temporary-dir-for-unpacking-a-zipfile-into
   $tempfile=tempnam(sys_get_temp_dir(),$prefix);
   if (file_exists($tempfile)) {
      unlink($tempfile);
   }
   $tempfile = $tempfile . ".d";
   mkdir($tempfile);
   if (is_dir($tempfile)) {
      return $tempfile;
   }
   else { print("Directory access error in result generation, line ".__LINE__.".\n"); exit(); }   
}


function make_and_change_into_working_dirs() {
   $tmpdir = mktempdir("results");

   chdir($tmpdir);

   return $tmpdir;
}


function cmp_user_info(&$a, &$b) {
   if ($a["lastname"] < $b["lastname"]) return -1;
   if ($a["lastname"] > $b["lastname"]) return 1; 
   return ($a["firstname"] < $b["firstname"]) ? -1 : 1;
}


function &obtain_user_information(&$db, $main_group_id) {
   $user_information = array();

   $stmt = $db->prepare("SELECT users.ID, users.sLogin, users.sFirstName, users.sLastName
      FROM users
         JOIN groups_ancestors ON users.idGroupSelf = groups_ancestors.idGroupChild 
      WHERE groups_ancestors.idGroupAncestor = :groupId;");
   if ($stmt->execute(['groupId' => $main_group_id])) {
      while ($row = $stmt->fetch()) {
         $user_information[$row["ID"]] = array("login" => $row["sLogin"], "firstname" => $row["sFirstName"], "lastname" => $row["sLastName"], "results" => array());
      }
   }
   else { print("Database error in result generation, line ".__LINE__.".\n"); exit(); }

   uasort($user_information, 'cmp_user_info');
   
   return $user_information;
}


function make_item_directory_tree(&$db, &$item_information, $item_id, $item_order_number, $remember_dir = false) {
   $stmt = $db->prepare("SELECT items.sTextId, items_strings.sTitle  FROM items join items_strings on items_strings.idItem = items.ID WHERE items.ID = :itemId;");
   if ($stmt->execute(['itemId' => $item_id])) {
      if ($row = $stmt->fetch()) {
      
         $dir = make_and_change_directory($item_order_number . "-" . $row["sTitle"]);
         
         $item_information[$item_id] = array("name" => $row["sTitle"], "directory" => getcwd());
      
         $stmt_loc = $db->prepare("SELECT idItemChild, iChildOrder FROM items_items WHERE idItemParent = :itemId ORDER BY iChildOrder ASC;");
         if ($stmt_loc->execute(['itemId' => $item_id])) {
            while ($row_loc = $stmt_loc->fetch()) {
               make_item_directory_tree($db, $item_information, $row_loc["idItemChild"], $row_loc["iChildOrder"]);
            }
         }
         else { print("Database error in result generation, line ".__LINE__.".\n"); exit(); }
         return_from_directory();
      }
      else { print("Database error in result generation, line ".__LINE__.".\n"); exit(); }
   }
   else { print("Database error in result generation, line ".__LINE__.".\n"); exit(); }
   return $dir;
}


function &obtain_item_information(&$db, $main_item_id, &$base_dir) {
   $item_information = array();

   $base_dir = make_item_directory_tree($db, $item_information, $main_item_id, 0, true);
   
   return $item_information;
}


function populate_user_information(&$db, &$user_information, &$item_information, $main_group_id, $main_item_id) {
   $stmt = $db->prepare("SELECT users_items.idUser, users_items.idItem, users_items.iScore,
         users_items.nbSubmissionsAttempts, users_items.bValidated, users_items.bFinished, users_items.sStartDate, users_items.sValidationDate, users_items.nbCorrectionsRead, users_items.nbHintsCached, users_items.nbCorrectionsRead, users_items.nbTasksWithHelp, users_items.nbChildrenValidated, users_items.nbTasksSolved, users_items.nbTasksTried
      FROM users_items
         JOIN users ON users_items.idUser = users.ID 
         JOIN groups_ancestors ON users.idGroupSelf = groups_ancestors.idGroupChild 
         JOIN items_ancestors ON users_items.idItem = items_ancestors.idItemChild
      WHERE groups_ancestors.idGroupAncestor = :groupId
         AND items_ancestors.idItemAncestor = :itemId;");
   if ($stmt->execute(['groupId' => $main_group_id, 'itemId' => $main_item_id])) {
      while ($row = $stmt->fetch()) {
         $user_information[$row["idUser"]]["results"][$row["idItem"]] = array("score" => $row["iScore"], 
              "jsondata" => array("nbSubmissionsAttempts" => $row["nbSubmissionsAttempts"],
                                  "iScore"                => $row["iScore"],
                                  "bValidated"            => $row["bValidated"],
                                  "bFinished"             => $row["bFinished"],
                                  "sStartDate"            => $row["sStartDate"],
                                  "sValidationDate"       => $row["sValidationDate"],
                                  "nbHints"               => $row["nbHintsCached"],
                                  "nbCorrectionsRead"     => $row["nbCorrectionsRead"],
                                  "nbTasksWithHelp"       => $row["nbTasksWithHelp"],
                                  "nbChildrenValidated"   => $row["nbChildrenValidated"],
                                  "nbTasksSolved"         => $row["nbTasksSolved"],
                                  "nbTasksTried"          => $row["nbTasksTried"]));
         //print("Add score for " . $row["idUser"] .":". $row["idItem"] ."\n");
      }
   }
   else { print("Database error in result generation, line ".__LINE__.".\n"); exit(); }

   // ------ BEGIN SECTION
   //
   // This section must be removed if items are their own ancestors in the database
   // 
   $stmt = $db->prepare("SELECT users_items.idUser, users_items.idItem, users_items.iScore,
         users_items.nbSubmissionsAttempts, users_items.bValidated, users_items.bFinished, users_items.sStartDate, users_items.sValidationDate, users_items.nbCorrectionsRead, users_items.nbHintsCached, users_items.nbCorrectionsRead, users_items.nbTasksWithHelp, users_items.nbChildrenValidated, users_items.nbTasksSolved, users_items.nbTasksTried
      FROM users_items
         JOIN users ON users_items.idUser = users.ID 
         JOIN groups_ancestors ON users.idGroupSelf = groups_ancestors.idGroupChild 
      WHERE groups_ancestors.idGroupAncestor = :groupId
         AND users_items.idItem = :itemId;");
   if ($stmt->execute(['groupId' => $main_group_id, 'itemId' => $main_item_id])) {
      while ($row = $stmt->fetch()) {
         $user_information[$row["idUser"]]["results"][$row["idItem"]] = array("score" => $row["iScore"], 
              "jsondata" => array("nbSubmissionsAttempts" => $row["nbSubmissionsAttempts"],
                                  "iScore"                => $row["iScore"],
                                  "bValidated"            => $row["bValidated"],
                                  "bFinished"             => $row["bFinished"],
                                  "sStartDate"            => $row["sStartDate"],
                                  "sValidationDate"       => $row["sValidationDate"],
                                  "nbHints"               => $row["nbHintsCached"],
                                  "nbCorrectionsRead"     => $row["nbCorrectionsRead"],
                                  "nbTasksWithHelp"       => $row["nbTasksWithHelp"],
                                  "nbChildrenValidated"   => $row["nbChildrenValidated"],
                                  "nbTasksSolved"         => $row["nbTasksSolved"],
                                  "nbTasksTried"          => $row["nbTasksTried"]));
         //print("Add score for " . $row["idUser"] .":". $row["idItem"] ."\n");
      }
   }
   else { print("Database error in result generation, line ".__LINE__.".\n"); exit(); }
   // ------ END SECTION
}

$langProgToExt = [
  'c' => 'c',
  'cpp' => 'cpp',
  'pascal' => 'pas',
  'ocaml' => 'ml',
  'java' => 'java',
  'javascool' => 'jvs',
  'text' => 'txt',
  'python' => 'py',
  'python3' => 'py',
  'php' => 'php',
  'javascript' => 'js'
];

function write_files(&$db, &$user_information, &$item_information) {
   global $langProgToExt;
   $csv = fopen("grades.csv", "w");
      if ($csv) {

      foreach ($item_information as $item_info) {
         fwrite($csv,";" . $item_info["name"]);
      }

      fwrite($csv,"\n");

      $stmt = $db->prepare("SELECT sAnswer, iScore, ID FROM users_answers WHERE idUser = :userId AND idItem = :itemId order by sSubmissionDate asc;");
            
      foreach($user_information as $userId => $user_info) {
         if ($user_info["lastname"] == "") $user_info["lastname"] = "Nom non renseigné";
         if ($user_info["firstname"] == "") $user_info["firstname"] = "Prénom non renseigné";
         fwrite($csv,$user_info["login"]);
         foreach($item_information as $itemId => $item_info) {
            $directory = $item_info["directory"] . "/" . $user_info["login"] . "/";
            mkdir($directory);
         
            if (array_key_exists ($itemId, $user_info["results"])) {
               fwrite($csv,";" . $user_info["results"][$itemId]["score"]);
               
               $file = fopen($directory . "data.json", "w");
               if ($file) {
                  fwrite($file, json_encode($user_info["results"][$itemId]["jsondata"]));
                  fclose($file);
               }
               else { print("File access error in result generation, line ".__LINE__.".\n"); exit(); }   
            }
            else fwrite($csv,";");
            ////print($userId . ':' . $itemId . ':');
            
            $counter = 0;
            if ($stmt->execute(['userId' => $userId, 'itemId' => $itemId])) {
               while ($row = $stmt->fetch()) {
                  $sAnswer = $row['sAnswer'];
                  if (ctype_digit($sAnswer)) {
                     $filename = $directory . ++$counter . "-" . $row["iScore"] . "-"   . $row["ID"] . ".txt";
                     $answerContent = 'Soumission dans un format inconnu';
                  } else {
                     try {
                        $answer = json_decode($sAnswer, true);
                        $extension = isset($langProgToExt[$answer['langProg']]) ? $langProgToExt[$answer['langProg']] : 'txt';
                        $filename = $directory . ++$counter . "-" . $row["iScore"] . "-"   . $row["ID"] . "." . $extension;
                        // TODO: handle tests better (directory?)
                        $answerContent = $answer['sourceCode'] ? $answer['sourceCode'] : json_encode($answer['tests']);
                     } catch (Exception $e) {
                        $filename = $directory . ++$counter . "-" . $row["iScore"] . "-"   . $row["ID"] . ".txt";
                        $answerContent = 'Erreur dans la réponse : '.$sAnswer;
                     }
                  }
                  //print("Writing answer to ". $filename . "\n");
                  
                  $file = fopen($filename, "w");
                  if ($file) {
                     fwrite($file, $answerContent);
                     fclose($file);
                  }
                  else { print("File access error in result generation, line ".__LINE__.".\n"); exit(); }   
               }
            }
            else { print("Database error in result generation, line ".__LINE__.".\n"); exit(); }
         }
         fwrite($csv,"\n");
      }

      fclose($csv);
   }
   else { print("File access error in result generation, line ".__LINE__.".\n"); exit(); }   
}


function &make_zip_file_name(&$db, $main_group_id, $main_item_id) {
   $zip_id = "_" . date("Ymd");

   $stmt = $db->prepare("SELECT items.sTextId, groups.sName FROM items JOIN groups WHERE items.id = :itemId AND groups.id = :groupId");

   if ($stmt->execute(['itemId' => $main_item_id, 'groupId' => $main_group_id])) {
      if ($row = $stmt->fetch()) {
         //print("Item: ". $row["sTextId"] . "\n");
         //print("Group: ". $row["sName"] . "\n");
         
         $zip_id = $row["sName"] . "_" . $row["sTextId"] . $zip_id;
      }
      else { print("Database error in result generation, line ".__LINE__.".\n"); exit(); }
   }
   else { print("Database error in result generation, line ".__LINE__.".\n"); exit(); }

   $zip_id = preg_replace("/[^a-zA-Z0-9_\-]/", "_" , $zip_id);
   
   return $zip_id;
}


$base_dir = "";

$wdir = make_and_change_into_working_dirs();

$user_information = obtain_user_information($db, $main_group_id);
$item_information = obtain_item_information($db, $main_item_id, $base_dir);

populate_user_information($db, $user_information, $item_information, $main_group_id, $main_item_id);

write_files($db, $user_information, $item_information);


//print("Creating zip file ".$zip_id.".zip ... ");
$zip_id = make_zip_file_name($db, $main_group_id, $main_item_id);
exec("zip -r ". $zip_id . ".zip " . $base_dir . " grades.csv");
//print("done. \n");

header("Content-Type: application/zip");
header("Content-Disposition: attachment; filename=".$zip_id.".zip");
header("Content-Length: " . filesize($zip_id.".zip"));

readfile($zip_id.".zip");

?>